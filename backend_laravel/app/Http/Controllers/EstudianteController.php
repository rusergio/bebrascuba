<?php

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\EstudianteController;

use App\Models\Edicion;
use App\Models\Profesor;
use App\Models\Escuela;
use App\Models\EstudianteEscuela;
use App\Models\ProfesorEstudiante;
use App\Models\Categoria;
use App\Http\Concerns\AuthorizesAccess;

class EstudianteController extends Controller
{
    use AuthorizesAccess;
    /**
     * Funcion para inscribir un estudiante 
     */
    public function inscribir(Request $request)
    {
        // Verificar si hay una edición abierta
        $edicionActual = Edicion::where('abierto', true)->first();
        if (!$edicionActual) {
            return response()->json([
                'message' => 'No hay una edición abierta, por lo que no se puede registrar un nuevo estudiante.'
            ], 400);
        }

        // Validar los datos de entrada
        // IMPORTANTE: id_profesor ahora representa user_id (ID de la tabla users)
        $validatedData = $request->validate([
            'nro_ci' => 'required|string|size:11|unique:estudiantes,nro_ci',
            'nombre' => 'required|string|max:80',
            'sexo' => 'required|in:Masculino,Femenino',
            'id_profesor' => 'required|integer|exists:users,id', // Validar que existe en users
            'id_escuela' => 'required|integer|exists:escuelas,id',
            'grado' => 'required|integer|min:1|max:12',
        ], [
            'nro_ci.required' => 'El número de CI es requerido',
            'nro_ci.size' => 'El número de CI debe tener 11 dígitos',
            'nro_ci.unique' => 'Ya existe un estudiante con este número de CI',
            'nombre.required' => 'El nombre es requerido',
            'sexo.required' => 'El sexo es requerido',
            'sexo.in' => 'El sexo debe ser Masculino o Femenino',
            'id_profesor.required' => 'El ID del profesor es requerido',
            'id_profesor.exists' => 'El profesor especificado no existe',
            'id_escuela.required' => 'El ID de la escuela es requerido',
            'id_escuela.exists' => 'La escuela especificada no existe',
            'grado.required' => 'El grado es requerido',
            'grado.integer' => 'El grado debe ser un número',
            'grado.min' => 'El grado debe ser al menos 1',
            'grado.max' => 'El grado no puede ser mayor a 12',
        ]);

        try {
            $authUser = $request->user();
            if (!$authUser) {
                return response()->json(['message' => 'No autenticado'], 401);
            }

            $puedeInscribir = $authUser->id === (int) $validatedData['id_profesor']
                || $this->isAdminOrCoordinator($authUser);

            if (!$puedeInscribir) {
                return response()->json(['message' => 'No puedes inscribir estudiantes para otro profesor'], 403);
            }

            // IMPORTANTE: id_profesor viene como user_id (ID de la tabla users)
            // Necesitamos encontrar el profesor usando user_id para obtener su id de profesores
            $profesor = Profesor::where('user_id', $validatedData['id_profesor'])->first();
            
            if (!$profesor) {
                return response()->json([
                    'message' => 'No se encontró un registro de profesor asociado al usuario especificado',
                    'error' => 'Profesor no encontrado para user_id: ' . $validatedData['id_profesor']
                ], 400);
            }

            // Crear el estudiante en la tabla 'estudiantes'
            $estudiante = Estudiante::create([
                'nro_ci' => $validatedData['nro_ci'],
                'nombre' => $validatedData['nombre'],
                'sexo' => $validatedData['sexo'],
                'editado' => false,
                'inscrito' => false,
            ]);

            // Registrar la relación en 'profesor_estudiante'
            // IMPORTANTE: usar el ID de la edición, no el número de edición
            // IMPORTANTE: id_profesor debe ser el id de la tabla profesores, no user_id
            // Pero el usuario quiere usar user_id, así que guardamos user_id directamente
            // Esto requiere que la migración se actualice para permitir esto
            ProfesorEstudiante::create([
                'id_profesor' => $profesor->id, // Usar el id de profesores para cumplir con la FK
                'id_estudiante' => $estudiante->id,
                'edicion' => $edicionActual->id, // Usar el ID de la edición
            ]);
            
            \Log::info('Estudiante inscrito', [
                'estudiante_id' => $estudiante->id,
                'profesor_id' => $profesor->id,
                'user_id' => $validatedData['id_profesor'],
                'edicion' => $edicionActual->id
            ]);

            // Obtener la categoría según el grado del estudiante
            $categoria = Categoria::where('grado_inferior', '<=', $validatedData['grado'])
                ->where('grado_superior', '>=', $validatedData['grado'])
                ->first();

            if (!$categoria) {
                return response()->json([
                    'message' => 'No se encontró una categoría para el grado especificado',
                    'error' => 'Categoría no encontrada para el grado ' . $validatedData['grado']
                ], 400);
            }

            // Registrar la relación en 'estudiante_escuela'
            // IMPORTANTE: usar el ID de la edición, no el número de edición
            EstudianteEscuela::create([
                'id_estudiante' => $estudiante->id,
                'id_escuela' => $validatedData['id_escuela'],
                'id_categoria' => $categoria->id,
                'edicion' => $edicionActual->id, // Usar el ID de la edición
                'grado' => $validatedData['grado'],
                'puntuacion' => null,
                'medalla' => null,
            ]);

            // Respuesta exitosa
            return response()->json([
                'message' => 'Estudiante registrado correctamente',
                'estudiante' => $estudiante,
            ], 201);

        } catch (\Exception $e) {
            // Manejar errores inesperados
            return response()->json([
                'message' => 'Error al inscribir al estudiante',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Incrementa el grado de estudiantes registrados en la edición abierta.
     */
    public function subirGrado(Request $request)
    {
        $edicionActual = Edicion::where('abierto', true)->first();
        if (!$edicionActual) {
            return response()->json(['message' => 'No hay una edición abierta.'], 400);
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:estudiantes,id',
            'id_profesor' => 'required|integer|exists:users,id',
        ]);

        $authUser = $request->user();
        if (!$authUser) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        if ($authUser->id !== (int) $validated['id_profesor'] && !$this->isAdminOrCoordinator($authUser)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $profesor = Profesor::where('user_id', $validated['id_profesor'])->first();
        if (!$profesor) {
            return response()->json(['message' => 'Profesor no encontrado'], 404);
        }

        $idsProfesorBuscar = $this->idsProfesorParaVinculos(
            (int) $profesor->id,
            (int) $validated['id_profesor'],
        );

        $actualizados = 0;
        foreach ($validated['ids'] as $idEstudiante) {
            $estudianteEscuela = EstudianteEscuela::where('id_estudiante', $idEstudiante)
                ->where('edicion', $edicionActual->id)
                ->first();

            // Si aún no está en la edición actual, subir grado en su última edición registrada
            if (!$estudianteEscuela) {
                $vinculoPrevio = ProfesorEstudiante::whereIn('id_profesor', $idsProfesorBuscar)
                    ->where('id_estudiante', $idEstudiante)
                    ->where('edicion', '!=', $edicionActual->id)
                    ->whereNull('deleted_at')
                    ->orderByDesc('edicion')
                    ->first();

                if (!$vinculoPrevio) {
                    continue;
                }

                $estudianteEscuela = EstudianteEscuela::where('id_estudiante', $idEstudiante)
                    ->where('edicion', $vinculoPrevio->edicion)
                    ->first();
            }

            if (!$estudianteEscuela || $estudianteEscuela->grado >= 12) {
                continue;
            }

            $nuevoGrado = $estudianteEscuela->grado + 1;
            $categoria = Categoria::where('grado_inferior', '<=', $nuevoGrado)
                ->where('grado_superior', '>=', $nuevoGrado)
                ->first();

            $estudianteEscuela->update([
                'grado' => $nuevoGrado,
                'id_categoria' => $categoria?->id ?? $estudianteEscuela->id_categoria,
            ]);
            $actualizados++;
        }

        return response()->json([
            'message' => "Se actualizó el grado de {$actualizados} estudiante(s).",
            'actualizados' => $actualizados,
        ]);
    }

    /**
     * Reinscribe en la edición abierta: actualiza estado a inscrito sin tratarlos como nuevos.
     */
    public function reinscribir(Request $request)
    {
        $edicionActual = Edicion::where('abierto', true)->first();
        if (!$edicionActual) {
            return response()->json(['message' => 'No hay una edición abierta.'], 400);
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:estudiantes,id',
            'id_profesor' => 'required|integer|exists:users,id',
        ]);

        $authUser = $request->user();
        if (!$authUser) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        if ($authUser->id !== (int) $validated['id_profesor'] && !$this->isAdminOrCoordinator($authUser)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $profesor = Profesor::where('user_id', $validated['id_profesor'])->first();
        if (!$profesor) {
            return response()->json(['message' => 'Profesor no encontrado'], 404);
        }

        $idsProfesorBuscar = $this->idsProfesorParaVinculos(
            (int) $profesor->id,
            (int) $validated['id_profesor'],
        );

        $reinscritos = 0;
        foreach ($validated['ids'] as $idEstudiante) {
            $vinculoPrevio = ProfesorEstudiante::whereIn('id_profesor', $idsProfesorBuscar)
                ->where('id_estudiante', $idEstudiante)
                ->where('edicion', '!=', $edicionActual->id)
                ->whereNull('deleted_at')
                ->orderByDesc('edicion')
                ->first();

            if (!$vinculoPrevio) {
                continue;
            }

            $vinculoActual = ProfesorEstudiante::where('id_profesor', $profesor->id)
                ->where('id_estudiante', $idEstudiante)
                ->where('edicion', $edicionActual->id)
                ->whereNull('deleted_at')
                ->first();

            if (!$vinculoActual) {
                ProfesorEstudiante::create([
                    'id_profesor' => $profesor->id,
                    'id_estudiante' => $idEstudiante,
                    'edicion' => $edicionActual->id,
                ]);

                $escuelaPrev = EstudianteEscuela::where('id_estudiante', $idEstudiante)
                    ->where('edicion', $vinculoPrevio->edicion)
                    ->first();

                if ($escuelaPrev) {
                    EstudianteEscuela::updateOrCreate(
                        [
                            'id_estudiante' => $idEstudiante,
                            'edicion' => $edicionActual->id,
                        ],
                        [
                            'id_escuela' => $escuelaPrev->id_escuela,
                            'grado' => $escuelaPrev->grado,
                            'id_categoria' => $escuelaPrev->id_categoria,
                        ]
                    );
                }
            }

            $estudiante = Estudiante::find($idEstudiante);
            if ($estudiante && !$estudiante->inscrito) {
                $estudiante->update(['inscrito' => true]);
                $reinscritos++;
            }
        }

        return response()->json([
            'message' => "Se reinscribieron {$reinscritos} estudiante(s) en el concurso.",
            'reinscritos' => $reinscritos,
        ]);
    }

    /**
     * Marca estudiantes como inscritos en el concurso (edición abierta).
     */
    public function preinscribir(Request $request)
    {
        $edicionActual = Edicion::where('abierto', true)->first();
        if (!$edicionActual) {
            return response()->json(['message' => 'No hay una edición abierta.'], 400);
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:estudiantes,id',
            'id_profesor' => 'required|integer|exists:users,id',
        ]);

        $authUser = $request->user();
        if (!$authUser) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        if ($authUser->id !== (int) $validated['id_profesor'] && !$this->isAdminOrCoordinator($authUser)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $profesor = Profesor::where('user_id', $validated['id_profesor'])->first();
        if (!$profesor) {
            return response()->json(['message' => 'Profesor no encontrado'], 404);
        }

        $idsProfesorBuscar = $this->idsProfesorParaVinculos(
            (int) $profesor->id,
            (int) $validated['id_profesor'],
        );

        $preinscritos = 0;
        foreach ($validated['ids'] as $idEstudiante) {
            $vinculo = ProfesorEstudiante::whereIn('id_profesor', $idsProfesorBuscar)
                ->where('id_estudiante', $idEstudiante)
                ->where('edicion', $edicionActual->id)
                ->whereNull('deleted_at')
                ->first();

            if (!$vinculo) {
                continue;
            }

            $estudiante = Estudiante::find($idEstudiante);
            if ($estudiante && !$estudiante->inscrito) {
                $estudiante->update(['inscrito' => true]);
                $preinscritos++;
            }
        }

        return response()->json([
            'message' => "Se inscribieron {$preinscritos} estudiante(s) en el concurso.",
            'preinscritos' => $preinscritos,
        ]);
    }

}
