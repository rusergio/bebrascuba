<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Profesor;
use App\Models\Edicion;
use App\Models\User;
use App\Models\Rol;
use App\Models\RoleUser;
use App\Support\TerritorioCoord;

class CoordinadorController extends Controller
{
    /**
     * Funciones para el coordinador nacional
     * @author: Rui Sérgio Mané
     */

    // Función para aceptar la solicitud el profesor
    public function aceptarSolicitud(Request $request, $profesorId)
    {
        $profesor = Profesor::findOrFail($profesorId);

        $escuela = DB::table('profesor_escuela as pe')
            ->join('escuelas as esc', 'pe.id_escuela', '=', 'esc.id')
            ->where('pe.id_profesor', $profesor->id)
            ->whereNull('pe.deleted_at')
            ->orderByDesc('pe.edicion')
            ->select('esc.id', 'esc.nombre', 'esc.validado')
            ->first();

        if ($escuela && !(bool) $escuela->validado) {
            return response()->json([
                'message' => 'Debe aprobar primero la escuela "' . $escuela->nombre . '" antes de activar al profesor.',
                'status' => 422,
                'codigo' => 'escuela_pendiente',
                'id_escuela' => $escuela->id,
            ], 422);
        }

        $profesor->esta_activo = true;
        $profesor->es_nuevo = false;
        $profesor->save();

        return response()->json([
            'message' => 'Profesor activado con éxito',
            'status' => 200,
        ], 200);
    }

    // Función para listar profesores nuevos y no activos
    public function listarProfesoresInactivos(Request $request)
    {
        $query = Profesor::where('esta_activo', false)
            ->select(
                'profesores.id',
                'profesores.es_nuevo',
                'profesores.esta_activo',
                'profesores.perfil_editado',
                'users.nombre',
                'users.apellidos',
                'users.correo',
                'users.telefono',
                'users.nro_ci',
                'escuelas.id as id_escuela',
                'escuelas.nombre as nombre_escuela',
                'escuelas.validado as escuela_validado',
                'subsistema_escuelas.nombre as subsistema',
                'escuelas.poblado',
                'escuelas.telefono as telefono_escuela',
                'municipios.nombre as municipio',
                'municipios.codigo as cdgo_municipio',
                'provincias.nombre as provincia',
                'provincias.codigo as cdgo_provincia'
            )
            ->join('users', 'profesores.user_id', '=', 'users.id')
            ->join('profesor_escuela', 'profesores.id', '=', 'profesor_escuela.id_profesor')
            ->join('escuelas', 'profesor_escuela.id_escuela', '=', 'escuelas.id')
            ->join('subsistema_escuelas', 'escuelas.subsistema_id', '=', 'subsistema_escuelas.id')
            ->join('municipios', 'escuelas.cdgo_municipio', '=', 'municipios.codigo')
            ->join('provincias', 'municipios.cdgo_provincia', '=', 'provincias.codigo')
            ->whereNull('profesores.deleted_at')
            ->whereNull('users.deleted_at')
            ->whereNull('profesor_escuela.deleted_at');

        $territorio = TerritorioCoord::forUser($request->user());
        if ($territorio) {
            if (!empty($territorio['municipio_codigo'])) {
                $query->where('municipios.codigo', $territorio['municipio_codigo']);
            } else {
                $query->where('provincias.codigo', $territorio['provincia_codigo']);
            }
        }

        $profesores = $query
            ->orderBy('provincias.nombre')
            ->orderBy('municipios.nombre')
            ->orderBy('users.apellidos')
            ->get()
            ->map(function ($item) {
                $item->escuela_validado = (bool) $item->escuela_validado;
                return $item;
            });

        return response()->json($profesores);
    }

    /**
     * Territorio del coordinador autenticado (provincial/municipal).
     */
    public function miTerritorio(Request $request)
    {
        $territorio = TerritorioCoord::forUser($request->user());

        if (!$territorio) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene territorio de coordinación asignado',
                'territorio' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'territorio' => $territorio,
        ]);
    }

    // General tabla de estudiante
    public function generateTable(Request $request) {  
        // Obtener los datos de la solicitud  
        $columns = $request->input('columns', []);  
        $groupByCategory = $request->input('groupByCategory', false);  
        $groupBySex = $request->input('groupBySex', false);  

        // Consulta base  
        $query = Estudiante::query();  

        // Seleccionar columnas  
        if (!empty($columns)) {  
            $query->select($columns);  
        }  

        // Agrupar por categoría  
        if ($groupByCategory) {  
            $query->orderBy('categoria');  
        }  

        // Agrupar por sexo  
        if ($groupBySex) {  
            $query->orderBy('sexo');  
        }  

        // Obtener los datos  
        $estudiantes = $query->get();  

        // Agrupar los datos según las opciones seleccionadas  
        $groupedData = [];  
        if ($groupByCategory && $groupBySex) {  
            $groupedData = $estudiantes->groupBy(['categoria', 'sexo']);  
        } elseif ($groupByCategory) {  
            $groupedData = $estudiantes->groupBy('categoria');  
        } elseif ($groupBySex) {  
            $groupedData = $estudiantes->groupBy('sexo');  
        } else {  
            $groupedData = $estudiantes;  
        }  

        return response()->json([  
            'data' => $groupedData,  
            'columns' => $columns,  
        ]);  
    }  

    /**
     * Funciones para el rol de administrador
     * @author: Rui Sérgio Mané
     */

    // Función para registrar un usuario y su rol
    public function registrarUsuarioRol(Request $request)
    {
        try {
            // Validar los datos del usuario
            $validator = Validator::make($request->all(), [
                'nro_ci' => 'required|unique:users,nro_ci',
                'nombre' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'telefono' => 'required|string|max:20',
                'correo' => 'required|email|unique:users,correo',
                'contrasenia' => 'required|string|min:6',
                'pin' => 'required|string|max:10',
                'rol' => 'required|string|exists:roles,rol', // Rol obligatorio y debe existir en la tabla
            ], [
                'nro_ci.unique' => 'Ya existe una persona con este número de CI',
                'correo.unique' => 'Este correo ya está registrado',
                'contrasenia.min' => 'La contraseña debe tener al menos 6 caracteres',
                'rol.required' => 'El rol es obligatorio',
                'rol.exists' => 'El rol especificado no existe en el sistema',
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
                'foto_perfil' => 'https://bebras.uclv.cu/wp-content/uploads/2024/09/logo-bebras-2024-1.png', // Foto por defecto
            ]);

            // Asignar el rol al usuario (ahora es obligatorio)
            $rol = Rol::where('rol', $request->input('rol'))->first();
            
            if ($rol) {
                // Asignar el rol al usuario usando el modelo RoleUser
                RoleUser::create([
                    'user_id' => $user->id,
                    'rol_id' => $rol->id
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente con rol: ' . $request->input('rol'),
                'data' => [
                    'usuario' => [
                        'id' => $user->id,
                        'nro_ci' => $user->nro_ci,
                        'nombre' => $user->nombre,
                        'apellidos' => $user->apellidos,
                        'correo' => $user->correo,
                        'rol_asignado' => $request->input('rol')
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    // Función para listar usuarios que SÍ son profesores
    public function listarProfesores() 
    {
        try {
            $rolProfesor = Rol::where('rol', 'Profesor')->first();

            if (!$rolProfesor) {
                return response()->json([
                    'success' => false,
                    'message' => 'El rol profesor no existe en la base de datos'
                ], 404);
            }

            // Usuarios que tienen el rol profesor
            $profesores = User::whereHas('roles', function ($query) use ($rolProfesor) {
                $query->where('rol_id', $rolProfesor->id);
            })->get();

            return response()->json([
                'success' => true,
                'profesores' => $profesores
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar profesores: ' . $e->getMessage()
            ], 500);
        }
    }

    // Función para listar usuarios que NO son profesores
    public function listarUsuariosNoProfesores()
    {
        try {
            $rolProfesor = Rol::where('rol', 'Profesor')->first();

            if (!$rolProfesor) {
                return response()->json([
                    'success' => false,
                    'message' => 'El rol profesor no existe en la base de datos'
                ], 404);
            }

            // Usuarios que no son profesores + incluir roles
            $usuarios = User::with('roles')
                ->whereDoesntHave('roles', function ($query) use ($rolProfesor) {
                    $query->where('rol_id', $rolProfesor->id);
                })
                ->get();

            return response()->json([
                'success' => true,
                'usuarios' => $usuarios
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar usuarios: ' . $e->getMessage()
            ], 500);
        }
    }

    // Función para listar usuarios que tienen múltiples roles
    public function listarUsuariosConMultiplesRoles()
    {
        try {
            $usuarios = User::with('roles')
                ->whereHas('roles', function ($query) {
                    $query;
                }, '>', 1)
                ->get();

            // Transformar los datos
            $usuariosTransformados = $usuarios->map(function ($user) {
                return [
                    'id' => $user->id,
                    'nombre' => $user->nombre,
                    'apellidos' => $user->apellidos,
                    'correo' => $user->correo,
                    'nro_ci' => $user->nro_ci,
                    'telefono' => $user->telefono,
                    'foto_perfil' => $user->foto_perfil,
                    'roles' => $user->roles->map(function ($rol) {
                        return [
                            'id' => $rol->id,
                            'rol' => $rol->rol,  // <- asegúrate que en tu modelo/migración se llama 'nombre' o 'rol'
                            'descripcion' => $rol->descripcion,
                            'estado' => $rol->estado
                        ];
                    })
                ];
            });

            return response()->json([
                'success' => true,
                'usuarios' => $usuariosTransformados
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar usuarios con múltiples roles: ' . $e->getMessage()
            ], 500);
        }
    }
 
}