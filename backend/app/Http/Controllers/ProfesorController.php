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
use App\Models\EstudianteEscuela;
use App\Models\Categoria;
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
                'id_escuela' => 'nullable|exists:escuelas,id',
            ], [
                'nro_ci.unique' => 'Ya existe una persona con este número de CI',
                'correo.unique' => 'Este correo ya está registrado',
                'contrasenia.min' => 'La contraseña debe tener al menos 6 caracteres',
                'id_escuela.exists' => 'La escuela especificada no existe',
            ]);

            if ($validator->fails()) {
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
                'foto_perfil' => 'https://bebras.uclv.cu/wp-content/uploads/2024/09/logo-bebras-2024-1.png',
            ]);

            // Obtener o crear el rol "Profesor"
            $rolProfesor = Rol::where('rol', 'Profesor')->first();
            
            if (!$rolProfesor) {
                // Si no existe el rol Profesor, lo creamos
                $rolProfesor = Rol::create([
                    'rol' => 'Profesor',
                    'descripcion' => 'Usuario con rol de profesor',
                    'estado' => true
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

            // Crear el registro en la tabla profesores
            $profesor = Profesor::create([
                'user_id' => $user->id,
                'es_nuevo' => true,
                'perfil_editado' => false,
                'esta_activo' => false, // Por defecto inactivo hasta que sea aprobado
            ]);

            // Si se proporcionó una escuela, crear la relación profesor_escuela
            if ($request->has('id_escuela') && $request->input('id_escuela')) {
                // Obtener la edición actual (o la última edición)
                $edicionActual = Edicion::orderBy('n_edicion', 'desc')->first();
                
                if ($edicionActual) {
                    ProfesorEscuela::create([
                        'id_profesor' => $profesor->id,
                        'id_escuela' => $request->input('id_escuela'),
                        'edicion' => $edicionActual->id, // Usar el ID de la edición
                    ]);
                }
            }

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
                    ],
                    'profesor' => [
                        'id' => $profesor->id,
                        'user_id' => $profesor->user_id,
                        'esta_activo' => $profesor->esta_activo,
                        'es_nuevo' => $profesor->es_nuevo
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

    // Función para registrar un profesor (alias de RegistSolicProf)
    public function registrarProfesor(Request $request)
    {
        return $this->RegistSolicProf($request);
    }

    // Función para verificar el número de CI
    public function verificarCI($nro_ci)
    {
        $user = User::where('nro_ci', $nro_ci)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Número de carnet no fue encontrado',
                'status' => 404
            ], 404);
        }

        $data = [
            'message' => 'Número de carnet encontrado',
            'user' => [
                'id' => $user->id,
                'nro_ci' => $user->nro_ci,
                'nombre' => $user->nombre,
                'apellidos' => $user->apellidos,
                'correo' => $user->correo,
                'ci' => $user->nro_ci, // Para compatibilidad con el frontend
            ],
            'status' => 200
        ];

        return response()->json($data, 200);
    }

    /**
     * Función para listar estudiantes que pertenecen a un profesor
     * @author: Rui Sérgio Mané
     * @param: $id_profesor
     * @return: response()->json
     */
    // public function listarEstudiantes($id_profesor) {
    //     try {
    //         // PASO 1: Verificar si el id existe en la tabla users
    //         $user = User::find($id_profesor);
            
    //         if (!$user) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'El usuario no existe'
    //             ], 404);
    //         }
            
    //         // PASO 2: Verificar si el usuario tiene roles asignados
    //         // Filtrar roles activos y relaciones en role_user que no estén eliminadas
    //         $roles = DB::table('role_user')
    //             ->join('roles', 'role_user.rol_id', '=', 'roles.id')
    //             ->where('role_user.user_id', $user->id)
    //             ->whereNull('role_user.deleted_at')
    //             ->whereNull('roles.deleted_at')
    //             ->select('roles.id', 'roles.rol', 'roles.descripcion', 'roles.estado')
    //             ->get();
            
    //         // Convertir a colección de modelos Rol si es necesario
    //         if ($roles->isEmpty()) {
    //             $roles = collect([]);
    //         } else {
    //             $roles = $roles->map(function($rol) {
    //                 return (object) [
    //                     'id' => $rol->id,
    //                     'rol' => $rol->rol,
    //                     'descripcion' => $rol->descripcion,
    //                     'estado' => $rol->estado
    //                 ];
    //             });
    //         }
            
    //         if ($roles->isEmpty()) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'No tiene rol asignado'
    //             ], 403);
    //         }
            
    //         // PASO 3: Verificar si existe en la tabla profesores
    //         $profesor = Profesor::where('user_id', $id_profesor)->first();
            
    //         if (!$profesor) {
    //             // Si el usuario existe pero no es profesor, retornar sus roles
    //             return response()->json([
    //                 'success' => true,
    //                 'message' => 'Usuario encontrado pero no es profesor',
    //                 'usuario' => [
    //                     'id' => $user->id,
    //                     'nombre' => $user->nombre,
    //                     'apellidos' => $user->apellidos,
    //                     'correo' => $user->correo
    //                 ],
    //                 'roles' => $roles->map(function($rol) {
    //                     return [
    //                         'id' => $rol->id,
    //                         'rol' => $rol->rol,
    //                         'descripcion' => $rol->descripcion
    //                     ];
    //                 })
    //             ], 200);
    //         }
            
    //         // PASO 4: Retornar información del usuario y sus roles
    //         $rolesInfo = $roles->map(function($rol) {
    //             return [
    //                 'id' => $rol->id,
    //                 'rol' => $rol->rol,
    //                 'descripcion' => $rol->descripcion
    //             ];
    //         });
            
    //         // Usar el id de la tabla profesores para la consulta
    //         $idProfesorTabla = $profesor->id;

    //         // Consulta simple: dado el id del profesor, buscar en profesor_estudiante
    //         // donde id_profesor coincida, y relacionar con estudiantes
    //         $estudiantes = DB::table('profesor_estudiante')
    //             ->where('profesor_estudiante.id_profesor', $idProfesorTabla)
    //             ->whereNull('profesor_estudiante.deleted_at')
    //             ->join('estudiantes', function($join) {
    //                 $join->on('profesor_estudiante.id_estudiante', '=', 'estudiantes.id')
    //                      ->whereNull('estudiantes.deleted_at');
    //             })
    //             ->select(
    //                 'estudiantes.id',
    //                 'estudiantes.nombre as nombre_estudiante',
    //                 'estudiantes.sexo'
    //             )
    //             ->orderBy('estudiantes.nombre')
    //             ->get();

    //         // Si no hay estudiantes, retornar información del usuario y roles con array vacío de estudiantes
    //         if ($estudiantes->isEmpty()) {
    //             return response()->json([
    //                 'success' => true,
    //                 'usuario' => [
    //                     'id' => $user->id,
    //                     'nombre' => $user->nombre,
    //                     'apellidos' => $user->apellidos,
    //                     'correo' => $user->correo
    //                 ],
    //                 'profesor' => [
    //                     'id' => $profesor->id,
    //                     'esta_activo' => $profesor->esta_activo,
    //                     'es_nuevo' => $profesor->es_nuevo
    //                 ],
    //                 'roles' => $rolesInfo,
    //                 'estudiantes' => []
    //             ], 200);
    //         }

    //         // Obtener información adicional de escuelas, grados y categorías
    //         $estudiantesConDetalles = [];
            
    //         foreach ($estudiantes as $item) {
    //             try {
    //                 // Validar que el item tenga las propiedades necesarias
    //                 if (!isset($item->id)) {
    //                     \Log::warning('Estudiante sin id', ['item' => $item]);
    //                     continue;
    //                 }

    //                 $estudianteId = $item->id;
    //                 $nombreEstudiante = $item->nombre_estudiante ?? 'Sin nombre';
    //                 $sexo = $item->sexo ?? 'No especificado';

    //                 // Buscar información de estudiante_escuela para obtener escuela, grado y categoría
    //                 $estudianteEscuela = DB::table('estudiante_escuela')
    //                     ->where('id_estudiante', $estudianteId)
    //                     ->whereNull('deleted_at')
    //                     ->orderBy('edicion', 'desc')
    //                     ->first();

    //                 $nombreEscuela = null;
    //                 $grado = null;
    //                 $categoria = null;

    //                 if ($estudianteEscuela) {
    //                     // Obtener nombre de la escuela
    //                     if (isset($estudianteEscuela->id_escuela)) {
    //                         $escuela = DB::table('escuelas')
    //                             ->where('id', $estudianteEscuela->id_escuela)
    //                             ->first();
    //                         $nombreEscuela = $escuela ? ($escuela->nombre ?? null) : null;
    //                     }
                        
    //                     $grado = $estudianteEscuela->grado ?? null;

    //                     // Obtener categoría según el grado
    //                     if ($grado !== null) {
    //                         $cat = DB::table('categorias')
    //                             ->where('grado_inferior', '<=', $grado)
    //                             ->where('grado_superior', '>=', $grado)
    //                             ->first();
    //                         $categoria = $cat ? ($cat->nombre_cuba ?? null) : null;
    //                     }
    //                 }

    //                 $estudiantesConDetalles[] = [
    //                     'id' => $estudianteId,
    //                     'nombre_estudiante' => $nombreEstudiante,
    //                     'nombre_escuela' => $nombreEscuela,
    //                     'sexo' => $sexo,
    //                     'grado' => $grado,
    //                     'categoria' => $categoria
    //                 ];
    //             } catch (\Exception $e) {
    //                 // Si hay error obteniendo detalles, al menos devolver los datos básicos
    //                 \Log::warning('Error obteniendo detalles del estudiante', [
    //                     'estudiante_item' => isset($item->id) ? $item->id : 'sin_id',
    //                     'error' => $e->getMessage(),
    //                     'trace' => $e->getTraceAsString()
    //                 ]);
                    
    //                 // Solo agregar si tiene al menos el id
    //                 if (isset($item->id)) {
    //                     $estudiantesConDetalles[] = [
    //                         'id' => $item->id,
    //                         'nombre_estudiante' => $item->nombre_estudiante ?? 'Sin nombre',
    //                         'nombre_escuela' => null,
    //                         'sexo' => $item->sexo ?? 'No especificado',
    //                         'grado' => null,
    //                         'categoria' => null
    //                     ];
    //                 }
    //             }
    //         }

    //         // Retornar estudiantes junto con información del usuario y roles
    //         return response()->json([
    //             'success' => true,
    //             'usuario' => [
    //                 'id' => $user->id,
    //                 'nombre' => $user->nombre,
    //                 'apellidos' => $user->apellidos,
    //                 'correo' => $user->correo
    //             ],
    //             'profesor' => [
    //                 'id' => $profesor->id,
    //                 'esta_activo' => $profesor->esta_activo,
    //                 'es_nuevo' => $profesor->es_nuevo
    //             ],
    //             'roles' => $rolesInfo,
    //             'estudiantes' => $estudiantesConDetalles
    //         ], 200);
    //     } catch (\Exception $e) {
    //         \Log::error('Error al listar estudiantes', [
    //             'parametro_recibido' => $id_profesor,
    //             'error' => $e->getMessage(),
    //             'file' => $e->getFile(),
    //             'line' => $e->getLine(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Error al listar estudiantes: ' . $e->getMessage(),
    //             'error_details' => [
    //                 'file' => $e->getFile(),
    //                 'line' => $e->getLine()
    //             ]
    //         ], 500);
    //     }
    // }

    public function listarEstudiantes($id_profesor) {
        try {
            // PASO 1: Verificar si el usuario existe
            $user = User::find($id_profesor);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'El usuario no existe'
                ], 404);
            }
            
            // PASO 2: Verificar si el usuario tiene el rol de Profesor
            $roles = DB::table('role_user')
                ->join('roles', 'role_user.rol_id', '=', 'roles.id')
                ->where('role_user.user_id', $user->id)
                ->whereNull('role_user.deleted_at')
                ->whereNull('roles.deleted_at')
                ->where('roles.estado', true)
                ->select('roles.id', 'roles.rol', 'roles.descripcion', 'roles.estado')
                ->get();
            
            if ($roles->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene rol asignado'
                ], 403);
            }
            
            // PASO 3: Verificar si existe en la tabla profesores
            $profesor = Profesor::where('user_id', $id_profesor)->first();
            
            if (!$profesor) {
                return response()->json([
                    'success' => true,
                    'message' => 'Usuario encontrado pero no es profesor',
                    'usuario' => [
                        'id' => $user->id,
                        'nombre' => $user->nombre,
                        'apellidos' => $user->apellidos,
                        'correo' => $user->correo
                    ],
                    'roles' => $roles->map(function($rol) {
                        return [
                            'id' => $rol->id,
                            'rol' => $rol->rol,
                            'descripcion' => $rol->descripcion
                        ];
                    })
                ], 200);
            }
            
            // PASO 4: Obtener los estudiantes del profesor
            $estudiantes = DB::table('profesor_estudiante as pe')
                ->join('estudiantes as e', 'pe.id_estudiante', '=', 'e.id')
                ->where('pe.id_profesor', $profesor->id)
                ->whereNull('pe.deleted_at')
                ->select(
                    'e.id',
                    'e.nro_ci',
                    'e.nombre as nombre_estudiante',
                    'e.sexo',
                    'pe.edicion'
                )
                ->orderBy('e.nombre')
                ->get();
    
            // Si no hay estudiantes
            if ($estudiantes->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'usuario' => [
                        'id' => $user->id,
                        'nombre' => $user->nombre,
                        'apellidos' => $user->apellidos,
                        'correo' => $user->correo
                    ],
                    'profesor' => [
                        'id' => $profesor->id,
                        'esta_activo' => $profesor->esta_activo,
                        'es_nuevo' => $profesor->es_nuevo
                    ],
                    'roles' => $roles->map(function($rol) {
                        return [
                            'id' => $rol->id,
                            'rol' => $rol->rol,
                            'descripcion' => $rol->descripcion
                        ];
                    }),
                    'estudiantes' => []
                ], 200);
            }
    
            // PASO 5: Obtener información adicional de cada estudiante
            $estudiantesConDetalles = [];
            
            foreach ($estudiantes as $estudiante) {
                // Obtener información de la escuela, grado y categoría
                $estudianteEscuela = DB::table('estudiante_escuela as ee')
                    ->join('escuelas as esc', 'ee.id_escuela', '=', 'esc.id')
                    ->leftJoin('categorias as cat', 'ee.id_categoria', '=', 'cat.id')
                    ->where('ee.id_estudiante', $estudiante->id)
                    ->whereNull('esc.deleted_at')
                    ->select(
                        'esc.nombre as nombre_escuela',
                        'ee.grado',
                        'cat.nombre_cuba as categoria',
                        'ee.puntuacion',
                        'ee.medalla',
                        'ee.edicion'
                    )
                    ->orderBy('ee.edicion', 'desc')
                    ->first();
    
                $estudiantesConDetalles[] = [
                    'id' => $estudiante->id,
                    'nro_ci' => $estudiante->nro_ci,
                    'nombre_estudiante' => $estudiante->nombre_estudiante,
                    'sexo' => $estudiante->sexo,
                    'nombre_escuela' => $estudianteEscuela->nombre_escuela ?? null,
                    'grado' => $estudianteEscuela->grado ?? null,
                    'categoria' => $estudianteEscuela->categoria ?? null,
                    'puntuacion' => $estudianteEscuela->puntuacion ?? null,
                    'medalla' => $estudianteEscuela->medalla ?? null,
                    'edicion' => $estudianteEscuela->edicion ?? $estudiante->edicion
                ];
            }
    
            // PASO 6: Retornar la respuesta completa
            return response()->json([
                'success' => true,
                'usuario' => [
                    'id' => $user->id,
                    'nombre' => $user->nombre,
                    'apellidos' => $user->apellidos,
                    'correo' => $user->correo,
                    'telefono' => $user->telefono,
                    'nro_ci' => $user->nro_ci
                ],
                'profesor' => [
                    'id' => $profesor->id,
                    'esta_activo' => $profesor->esta_activo,
                    'es_nuevo' => $profesor->es_nuevo,
                    'perfil_editado' => $profesor->perfil_editado
                ],
                'roles' => $roles->map(function($rol) {
                    return [
                        'id' => $rol->id,
                        'rol' => $rol->rol,
                        'descripcion' => $rol->descripcion
                    ];
                }),
                'total_estudiantes' => count($estudiantesConDetalles),
                'estudiantes' => $estudiantesConDetalles
            ], 200);
    
        } catch (\Exception $e) {
            \Log::error('Error al listar estudiantes', [
                'parametro_recibido' => $id_profesor,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al listar estudiantes: ' . $e->getMessage(),
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
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
            // IMPORTANTE: usar el ID de la edición, no el número de edición
            ProfesorEstudiante::create([
                'id_profesor' => $validatedData['id_profesor'],
                'id_estudiante' => $estudiante->id,
                'edicion' => $edicionActual->id, // Usar el ID de la edición
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

    /*
     * @author: DGLio+DeepSeek
     * @arg: Rutas para obtener profesores por provincia o municipio
     * date: 2025-10-25
     */

public function listarProfesoresPorProvincia($idProvincia)
{
    $profesores = DB::table('users as u')
        ->join('profesores as p', 'u.id', '=', 'p.user_id')
        ->join('profesor_escuela as pe', 'p.id', '=', 'pe.id_profesor')
        ->join('escuelas as esc', 'pe.id_escuela', '=', 'esc.id')
        ->join('municipios as mun', 'esc.cdgo_municipio', '=', 'mun.codigo')
        ->join('provincias as prov', 'mun.cdgo_provincia', '=', 'prov.codigo')
        ->where('prov.id', $idProvincia)
        ->where('esc.activo', true)
        ->where('p.esta_activo', true)
        ->select(
            'u.id',
            'u.nombre',
            'u.apellidos',
            'u.correo',
            'u.telefono',
            'u.nro_ci',
            'esc.nombre as escuela_nombre',
            'mun.nombre as municipio_nombre',
            'prov.nombre as provincia_nombre',
            'p.es_nuevo',
            'p.esta_activo'
        )
        ->distinct()
        ->orderBy('mun.nombre')
        ->orderBy('esc.nombre')
        ->orderBy('u.apellidos')
        ->orderBy('u.nombre')
        ->get();

    return response()->json($profesores);
}

public function listarProfesoresPorMunicipio($codigoMunicipio)
{
    $profesores = DB::table('users as u')
        ->join('profesores as p', 'u.id', '=', 'p.user_id')
        ->join('profesor_escuela as pe', 'p.id', '=', 'pe.id_profesor')
        ->join('escuelas as esc', 'pe.id_escuela', '=', 'esc.id')
        ->join('municipios as mun', 'esc.cdgo_municipio', '=', 'mun.codigo')
        ->join('provincias as prov', 'mun.cdgo_provincia', '=', 'prov.codigo')
        ->where('mun.codigo', $codigoMunicipio)
        ->where('esc.activo', true)
        ->where('p.esta_activo', true)
        ->select(
            'u.id',
            'u.nombre',
            'u.apellidos',
            'u.correo',
            'u.telefono',
            'u.nro_ci',
            'esc.nombre as escuela_nombre',
            'mun.nombre as municipio_nombre',
            'prov.nombre as provincia_nombre',
            'p.es_nuevo',
            'p.esta_activo'
        )
        ->distinct()
        ->orderBy('esc.nombre')
        ->orderBy('u.apellidos')
        ->orderBy('u.nombre')
        ->get();

    return response()->json($profesores);
}

public function listarProfesoresRegional($tipo, $valor)
{
    $query = DB::table('users as u')
        ->join('profesores as p', 'u.id', '=', 'p.user_id')
        ->join('profesor_escuela as pe', 'p.id', '=', 'pe.id_profesor')
        ->join('escuelas as esc', 'pe.id_escuela', '=', 'esc.id')
        ->join('municipios as mun', 'esc.cdgo_municipio', '=', 'mun.codigo')
        ->join('provincias as prov', 'mun.cdgo_provincia', '=', 'prov.codigo')
        ->where('esc.activo', true)
        ->where('p.esta_activo', true)
        ->select(
            'u.id',
            'u.nombre',
            'u.apellidos',
            'u.correo',
            'u.telefono',
            'u.nro_ci',
            'esc.nombre as escuela_nombre',
            'mun.nombre as municipio_nombre',
            'prov.nombre as provincia_nombre',
            'p.es_nuevo',
            'p.esta_activo'
        );

    if ($tipo === 'provincia') {
        $query->where('prov.id', $valor);
    } elseif ($tipo === 'municipio') {
        $query->where('mun.codigo', $valor);
    }

    $profesores = $query->distinct()
        ->orderBy('mun.nombre')
        ->orderBy('esc.nombre')
        ->orderBy('u.apellidos')
        ->orderBy('u.nombre')
        ->get();

    return response()->json($profesores);
}
}
