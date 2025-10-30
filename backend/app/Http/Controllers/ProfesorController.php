<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash; // Asegúrate de que esta línea esté incluida
use Illuminate\Support\Facades\DB;
use App\Models\Profesor;
use App\Models\ProfesorEscuela;
use App\Models\Edicion;
use App\Models\Escuela;
use App\Models\User;
use App\Models\Estudiante;
use App\Models\ProfesorEstudiante;
use App\Models\Rol;
use App\Models\RoleUser;
use Illuminate\Support\Facades\Mail;  

class ProfesorController extends Controller
{
    
    /**
     * Funciones para el rol de profesor
     * @author: Rui Sérgio Mané
     */
    
    // Función para registrar solicitud del profesor
    public function RegistSolicProf(Request $request){
        try {
            
            // Validar los datos del usuario
            $validator = Validator::make($request->all(), [
                'nro_ci' => 'required|unique:users,nro_ci',
                'nombre' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'telefono' => 'required|string|max:20',
                'correo' => 'required|email|unique:users,correo',
                'contrasenia' => 'required|string|min:6',
                'pin' => 'required|string|max:5',
                'id_escuela' => 'required|exists:escuelas,id',
            ], [
                'nro_ci.unique' => 'Ya existe una persona con este número de CI',
                'correo.unique' => 'Este correo ya está registrado',
                'contrasenia.min' => 'La contraseña debe tener al menos 6 caracteres',
                'id_escuela.required' => 'Debe seleccionar una escuela',
                'id_escuela.exists' => 'La escuela seleccionada no existe',
            ]);

            if ($validator->fails()) {
                \Log::info('Errores de validación:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Error en la validación de datos',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Crear el usuario
            $user = User::create([
                'nro_ci' => $request->input('nro_ci'),
                'nombre' => $request->input('nombre'),
                'apellidos' => $request->input('apellidos'),
                'telefono' => $request->input('telefono'),
                'correo' => $request->input('correo'),
                'contrasenia' => bcrypt($request->input('contrasenia')),
                'pin' => bcrypt($request->input('pin')),
            ]);

            // Obtener o crear el rol "Profesor"
            $rolProfesor = Rol::where('rol', 'Profesor')->first();
            
            if (!$rolProfesor) {
                // Si no existe el rol Profesor, lo creamos
                $rolProfesor = Rol::create([
                    'rol' => 'Profesor',
                    'descripcion' => 'Usuario con rol de profesor',
                    'estado' => false
                ]);
            }

            // Asignar el rol de profesor al usuario usando el modelo RoleUser
            RoleUser::create([
                'user_id' => $user->id,
                'rol_id' => $rolProfesor->id
            ]);

            // Verificar que se asignó correctamente
            $rolAsignado = RoleUser::where('user_id', $user->id)
                ->where('rol_id', $rolProfesor->id)
                ->first();

            if (!$rolAsignado) {
                throw new \Exception('Error al asignar el rol al usuario');
            }

            // Crear el profesor en la tabla profesores (solo con user_id y campos específicos)
            $profesor = Profesor::create([
                'user_id' => $user->id,
                'esta_activo' => false, // Inicialmente inactivo hasta que sea aprobado
                'es_nuevo' => true,
                'perfil_editado' => false,
            ]);

            // Crear la relación profesor-escuela
            ProfesorEscuela::create([
                'id_profesor' => $profesor->id,
                'id_escuela' => $request->input('id_escuela'),
                'edicion' => 1, // Edición por defecto, se puede ajustar según la lógica de negocio
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profesor registrado exitosamente',
                'data' => [
                    'usuario' => [
                        'id' => $user->id,
                        'nro_ci' => $user->nro_ci,
                        'nombre' => $user->nombre,
                        'apellidos' => $user->apellidos,
                        'correo' => $user->correo,
                        'rol_asignado' => 'Profesor',
                        'rol_id' => $rolProfesor->id
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar profesor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Función para listar estudiantes que pertenecen a un profesor
    public function listarEstudiantes($id_profesor) {
        $estudiantes = DB::table('profesores')
            ->where('profesores.id', $id_profesor)
            ->join('profesor_estudiante', 'profesores.id', '=', 'profesor_estudiante.id_profesor')
            ->join('estudiantes', 'profesor_estudiante.id_estudiante', '=', 'estudiantes.id')
            ->join('estudiante_escuela', 'estudiantes.id', '=', 'estudiante_escuela.id_estudiante')
            ->join('escuelas', 'estudiante_escuela.id_escuela', '=', 'escuelas.id')
            ->join('categorias', function ($join) {
                $join->on('estudiante_escuela.grado', '>=', 'categorias.grado_inferior')
                    ->on('estudiante_escuela.grado', '<=', 'categorias.grado_superior');
            })
            ->select(
                'estudiantes.id',
                'estudiantes.nombre as nombre_estudiante',
                'escuelas.nombre as nombre_escuela',
                'estudiantes.sexo',
                'estudiante_escuela.grado',
                'categorias.nombre_cuba as categoria'
            )
            ->get();
        return $estudiantes;
    }

    // Función para inscribir un estudiante
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
        $validatedData = $request->validate([
            'nro_ci' => 'required|string|size:11|unique:estudiantes,nro_ci',
            'nombre' => 'required|string|max:80',
            'sexo' => 'required|in:Masculino,Femenino',
            'id_profesor' => 'required|exists:profesores,id',
            'id_escuela' => 'required|exists:escuelas,id',
            'grado' => 'required|integer|min:1|max:12',
        ]);

        try {
            // Crear el estudiante en la tabla 'estudiantes'
            $estudiante = Estudiante::create([
                'nro_ci' => $validatedData['nro_ci'],
                'nombre' => $validatedData['nombre'],
                'sexo' => $validatedData['sexo'],
                'editado' => false,
                'inscrito' => true,
            ]);

            // Registrar la relación en 'profesor_estudiante'
            ProfesorEstudiante::create([
                'id_profesor' => $validatedData['id_profesor'],
                'id_estudiante' => $estudiante->id,
                'edicion' => $edicionActual->n_edicion,
            ]);

            // Registrar la relación en 'estudiante_escuela'
            EstudianteEscuela::create([
                'id_estudiante' => $estudiante->id,
                'id_escuela' => $validatedData['id_escuela'],
                'edicion' => $edicionActual->n_edicion,
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
