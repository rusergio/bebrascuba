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

class EstudianteController extends Controller
{
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
                'inscrito' => true,
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
                'message' => 'Estudiante inscrito correctamente',
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

}
