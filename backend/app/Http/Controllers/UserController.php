<?php

namespace App\Http\Controllers;

// LibrerÃ­as
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Modelos
use App\Models\User;
use App\Models\Edicion;
use App\Models\Rol;
use App\Models\RoleUser;

class UserController extends Controller
{
    /**
     * Funciones global para todos los usuarios
     * @author: Rui SÃ©rgio ManÃ©
     */

    public function actualizar(Request $request, $id)  {
        // Validar campos permitidos
        $validator = Validator::make($request->all(), [  
            'correo' => 'email|unique:profesors,correo,' . $id,  
            'telefono' => 'unique:profesors,telefono,' . $id,  
            'provincia' => 'nullable|string',  
            'municipio' => 'nullable|string',  
            'escuela' => 'nullable|string',  
            'esta_activo' => 'boolean',  
        ], [
            'correo.unique' => 'Este correo ya estÃ¡ registrado por otro profesor',
            'telefono.unique' => 'Este nÃºmero de telÃ©fono ya estÃ¡ registrado por otro profesor',
        ]);

        if ($validator->fails()) {  
            $data = [  
                'message' => 'Error en la validaciÃ³n de datos',  
                'errors' => $validator->errors(),  
                'status' => 400  
            ];  
            return response()->json($data, 400);  
        }  

        $profesor = Profesor::find($id);
        
        if (!$profesor) {
            return response()->json(['message' => 'Profesor no encontrado', 'status' => 404], 404);
        }

        // Actualizar solo los campos permitidos
        $profesor->update([
            'correo' => $request->input('correo', $profesor->correo),
            'telefono' => $request->input('telefono', $profesor->telefono),
            'provincia' => $request->input('provincia', $profesor->provincia),
            'municipio' => $request->input('municipio', $profesor->municipio),
            'escuela' => $request->input('escuela', $profesor->escuela),
            'esta_activo' => $request->input('esta_activo', $profesor->esta_activo),
        ]);

        $data = [
            'profesor' => $profesor,
            'message' => 'Datos del profesor actualizados con Ã©xito',
            'status' => 200
        ];

        return response()->json($data, 200);
    }

     // funciÃ³n para cambiar la contraseÃ±a del profesor
     public function cambiarContrasenia(Request $request, $userId) {
        // 
        $request->validate([
            'contrasenia' => 'required|string',
        ]);

        $user = User::findOrFail($userId);
        $profesor = Profesor::findOrFail($userId);

        $user->update([
            'contrasenia' => $request->contrasenia,
        ]);

        $profesor->update([
            'perfil_editado' => true,
        ]);
    }
    // funciÃ³n para cambiar el pin del profesor
    public function cambiarPin(Request $request, $userId) {
        // 
        $request->validate([
            'pin' => 'required|string',
        ]);

        $user = User::findOrFail($userId); 
        $profesor = Profesor::findOrFail($userId); 

        $user->update([
            'pin' => $request->pin,
        ]);

        $profesor->update([
            'perfil_editado' => true,
        ]);
    }
    // funciÃ³n para cambiar el correo del profesor
    public function cambiarCorreo(Request $request, $profesorId) {
        // 
        $request->validate([
            'correo' => 'required|string',
        ]);

        $profesor = Profesor::findOrFail($profesorId);

        $profesor->update([
            'correo' => $request->correo,
            'perfil_editado' => true,
        ]);
    }
    // funciÃ³n para cambiar el nÃºmero del telefono
    public function cambiarNroTelefono(Request $request, $profesorId) {
        // 
        $request->validate([
            'telefono' => 'required|string',
        ]);

        $profesor = Profesor::findOrFail($profesorId);

        $profesor->update([
            'telefono' => $request->telefono,
            'perfil_editado' => true,
        ]);
    }
    // funciÃ³n para verificar el carnet 
    public function verificarCI($nro_ci){

        $user = User::where('ci', $nro_ci)->first();

        if (!$user) {
            return response()->json(['message' => 'Numero de carnet no fue encontrado', 'status' => 404], 404);
        }

        $data = [
            'message' => 'Numero de carnet encontrado',
            'user' => $user,
            'status' => 200
        ];

        return response()->json($data, 200);
    }
    // funciÃ³n para verificar el pin
    public function verificarPin(Request $request) {  
        $request->validate([
            'ci' => 'required|string',
            'pin' => 'required|string',
        ]);

        $user = User::where('ci', $request->ci)->first();
        
        if (!$user || !Hash::check($request->pin, $user->pin)) {
            return response()->json(['message' => 'El pin del usuario no coencide'], 401);
        }
    
        // Si el PIN es correcto  
        $data = [  
            'message' => 'Pin del usuario coencide',  
            'user' => $user,  
            'status' => 200  
        ];  
            
        return response()->json($data, 200);  
    }
    // funciÃ³n para enviar el link de registro
    public function enviarLinkRegistro(Request $request) {  
        // Validar el correo electrÃ³nico  
        $validated = $request->validate([  
            'email' => 'required|email',  
        ]);  

        // URL de registro  
        $registrationUrl = 'http://localhost:5173/registro';  
        $email = $validated['email'];  

        try {  
            // Enviar el correo electrÃ³nico  
            Mail::send([], [], function ($message) use ($email, $registrationUrl) {  
                $message->to($email)  
                        ->from('bebrascuba@uclv.cu', env('APP_NAME'))  
                        ->subject('Registro en el sistema')  
                        ->text("Hola, utiliza este enlace para registrarte: $registrationUrl");  
            });  

            return response()->json(['message' => 'Correo enviado con Ã©xito'], 200);  
        } catch (\Exception $e) {  
            // Manejar errores al enviar el correo  
            return response()->json(['message' => 'Error al enviar el correo: ' . $e->getMessage()], 500);  
        }  
    }  
    // funciÃ³n para actualizar la imagen
    public function uploadPhoto(Request $request, $id) {
        $request->validate([
            'foto_perfil' => 'required|image|mimes:jpeg,png|max:2048',
        ]);

        $profesor = Profesor::findOrFail($id);

        // Eliminar foto anterior si existe (excepto la por defecto)
        if ($profesor->foto_perfil && !str_contains($profesor->foto_perfil, 'github.com')) {
            Storage::delete($profesor->foto_perfil);
        }

        $path = $request->file('foto_perfil')->store('profesores/fotos', 'public');
        $profesor->foto_perfil = $path;
        $profesor->save();

        return response()->json([
            'success' => true,
            'path' => asset("storage/$path")
        ]);
    }

    // funcion para eliminar la foto
    public function deletePhoto($id) {
        $profesor = Profesor::findOrFail($id);

        if ($profesor->foto_perfil && !str_contains($profesor->foto_perfil, 'github.com')) {
            Storage::delete($profesor->foto_perfil);
        }

        $profesor->foto_perfil = null;
        $profesor->save();

        return response()->json([
            'success' => true,
            'path' => 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png'
        ]);
    }

    // FunciÃ³n para asignar rol a un usuario
    public function asignarRol(Request $request, $userId) 
    {
        try {
            $validator = Validator::make($request->all(), [
                'rol' => 'required|string|exists:roles,rol',
            ], [
                'rol.exists' => 'El rol especificado no existe en el sistema',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error en la validaciÃ³n de datos',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Buscar usuario y rol
            $user = User::findOrFail($userId);
            $rol = Rol::where('rol', $request->input('rol'))->first();

            // âœ… Verificar si ya tiene el rol
            if ($user->roles()->where('rol_id', $rol->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "El usuario ya tiene asignado el rol '{$rol->nombre}'",
                    'roles_actuales' => $user->roles()->pluck('rol')
                ], 409); // 409 Conflict
            }

            // Asignar el rol
            $user->roles()->attach($rol->id);

            return response()->json([
                'success' => true,
                'message' => "Rol '{$rol->rol}' asignado correctamente al usuario {$user->nombre}",
                'roles_actuales' => $user->roles()->pluck('rol')
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al asignar rol: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Login simple y funcional
     * @author: Rui SÃrgio ManÃ©
     */
    public function login(Request $request)
    {
        try {
            // Validar datos de entrada
            $request->validate([
                'correo' => 'required|email',
                'contrasenia' => 'required|string',
            ]);

            // Buscar usuario por correo
            $user = User::where('correo', $request->correo)->first();

            // Verificar si el usuario existe
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 401);
            }

            // Verificar contraseña
            if (!Hash::check($request->contrasenia, $user->contrasenia)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Contraseña incorrecta'
                ], 401);
            }

            // Obtener roles del usuario
            $roles = $user->roles()->select('roles.id', 'rol', 'descripcion', 'estado')->get();

            if ($roles->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El usuario no tiene roles asignados. Contacta al administrador.'
                ], 403);
            }

            // Verificar si el usuario tiene el rol de Profesor
            $tieneRolProfesor = $roles->contains('rol', 'Profesor');

            // ===== VALIDACIONES ESPECÍFICAS PARA PROFESORES =====
            if ($tieneRolProfesor) {
                \Log::info('Intentando login de profesor', ['user_id' => $user->id]);

                // 1. Verificar si hay una edición abierta
                $edicionAbierta = Edicion::where('abierto', true)->first();
                
                if (!$edicionAbierta) {
                    return response()->json([
                        'success' => false,
                        'message' => 'La edición está cerrada en este momento. Por favor, aguarde por la abertura de la nueva edición del concurso.',
                        'tipo_error' => 'edicion_cerrada'
                    ], 403);
                }

                // 2. Buscar registro del profesor usando where en lugar de relación
                $profesor = \App\Models\Profesor::where('user_id', $user->id)->first();
                
                if (!$profesor) {
                    \Log::error('Usuario con rol Profesor sin registro en tabla profesores', ['user_id' => $user->id]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Tu cuenta de profesor no está completa. Por favor, contacta al administrador del sistema.',
                        'tipo_error' => 'registro_incompleto'
                    ], 403);
                }

                // 3. Verificar si el profesor está activo
                if (!$profesor->esta_activo) {
                    \Log::info('Intento de login de profesor inactivo', ['user_id' => $user->id, 'profesor_id' => $profesor->id]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Tu solicitud de registro está pendiente de aprobación. Por favor, contacta a tu coordinador municipal o provincial para que active tu cuenta.',
                        'tipo_error' => 'cuenta_inactiva'
                    ], 403);
                }

                // 4. Obtener escuela asignada
                $profesorEscuela = DB::table('profesor_escuela')
                    ->where('id_profesor', $profesor->id)
                    ->whereNull('deleted_at')
                    ->orderBy('edicion', 'desc')
                    ->first();

                if (!$profesorEscuela) {
                    \Log::warning('Profesor sin escuela asignada', ['user_id' => $user->id, 'profesor_id' => $profesor->id]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'No tienes una escuela asignada. Por favor, contacta a tu coordinador para que te asignen una escuela.',
                        'tipo_error' => 'sin_escuela'
                    ], 403);
                }

                // Todo OK para profesor - Preparar datos
                $datosProfesor = [
                    'id' => $profesor->id,
                    'id_escuela' => $profesorEscuela->id_escuela,
                    'edicion_actual' => $profesorEscuela->edicion,
                    'es_nuevo' => $profesor->es_nuevo,
                    'perfil_editado' => $profesor->perfil_editado,
                    'esta_activo' => $profesor->esta_activo
                ];

                // Crear token
                $token = $user->createToken('auth_token')->plainTextToken;

                \Log::info('Login exitoso de profesor', [
                    'user_id' => $user->id,
                    'profesor_id' => $profesor->id,
                    'escuela_id' => $profesorEscuela->id_escuela
                ]);

                // Respuesta exitosa para profesor
                return response()->json([
                    'success' => true,
                    'message' => 'Bienvenido Profesor',
                    'user' => [
                        'id' => $user->id,
                        'nombre' => $user->nombre,
                        'apellidos' => $user->apellidos,
                        'correo' => $user->correo,
                        'nro_ci' => $user->nro_ci,
                        'telefono' => $user->telefono,
                        'foto_perfil' => $user->foto_perfil,
                        'roles' => $roles,
                        'profesor' => $datosProfesor
                    ],
                    'token' => $token
                ], 200);
            }

            // ===== PARA OTROS ROLES =====
            // Roles que NO requieren validación de edición ni profesor activo:
            // Administrador, Coordinador Nacional, Coordinador Asistente,
            // Coordinador Provincial MINED, Coordinador Municipal MINED, etc.
            
            \Log::info('Login de usuario no-profesor', [
                'user_id' => $user->id,
                'roles' => $roles->pluck('rol')->toArray()
            ]);

            // Intentar obtener datos del profesor si existen (usuarios con múltiples roles)
            $profesor = \App\Models\Profesor::where('user_id', $user->id)->first();
            $datosProfesor = null;
            
            if ($profesor) {
                $profesorEscuela = DB::table('profesor_escuela')
                    ->where('id_profesor', $profesor->id)
                    ->whereNull('deleted_at')
                    ->orderBy('edicion', 'desc')
                    ->first();

                if ($profesorEscuela) {
                    $datosProfesor = [
                        'id' => $profesor->id,
                        'id_escuela' => $profesorEscuela->id_escuela,
                        'edicion_actual' => $profesorEscuela->edicion,
                        'es_nuevo' => $profesor->es_nuevo,
                        'perfil_editado' => $profesor->perfil_editado,
                        'esta_activo' => $profesor->esta_activo
                    ];
                }
            }

            // Crear token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Mensaje de bienvenida personalizado según el rol principal
            $primerRol = $roles->first();
            $mensajeBienvenida = 'Login exitoso';
            
            if ($primerRol) {
                $rolesConMensaje = [
                    'Administrador' => 'Bienvenido Administrador',
                    'Coordinador Nacional' => 'Bienvenido Coordinador Nacional',
                    'Coordinador Asistente' => 'Bienvenido Coordinador Asistente',
                    'Representante MINED/MES' => 'Bienvenido Representante',
                    'Representante Provincial MINED' => 'Bienvenido Representante Provincial',
                    'Coordinador Provincial MINED' => 'Bienvenido Coordinador Provincial',
                    'Coordinador Municipal MINED' => 'Bienvenido Coordinador Municipal',
                    'Elaborador Tareas Bebras' => 'Bienvenido Elaborador de Tareas',
                    'Revisor Tareas Bebras' => 'Bienvenido Revisor de Tareas',
                    'Colaborador Bebras' => 'Bienvenido Colaborador',
                    'Colaborador Universitario Bebras' => 'Bienvenido Colaborador Universitario',
                    'Responsable Colaborador Universitario Bebras' => 'Bienvenido Responsable de Colaboradores',
                ];
                
                $mensajeBienvenida = $rolesConMensaje[$primerRol->rol] ?? 'Bienvenido';
            }

            // Respuesta exitosa para otros roles
            return response()->json([
                'success' => true,
                'message' => $mensajeBienvenida,
                'user' => [
                    'id' => $user->id,
                    'nombre' => $user->nombre,
                    'apellidos' => $user->apellidos,
                    'correo' => $user->correo,
                    'nro_ci' => $user->nro_ci,
                    'telefono' => $user->telefono,
                    'foto_perfil' => $user->foto_perfil,
                    'roles' => $roles,
                    'profesor' => $datosProfesor
                ],
                'token' => $token
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error en login:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'correo' => $request->correo ?? 'no-email'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registro simple para crear usuarios de prueba
     * @author: Rui SÃ©rgio ManÃ©
     */
    
    public function register(Request $request)
    {
        try {
            // Validar datos de entrada segÃºn la estructura real de la tabla
            $request->validate([
                'nombre' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'correo' => 'required|email|unique:users,correo',
                'nro_ci' => 'required|string|unique:users,nro_ci',
                'telefono' => 'required|string|unique:users,telefono',
                'contrasenia' => 'required|string|min:6',
                'pin' => 'required|string|min:4',
            ]);

            // Crear el usuario con todos los campos requeridos
            $user = User::create([
                'nombre' => $request->nombre,
                'apellidos' => $request->apellidos,
                'correo' => $request->correo,
                'contrasenia' => Hash::make($request->contrasenia), // Hashear la contraseÃ±a
                'nro_ci' => $request->nro_ci,
                'telefono' => $request->telefono,
                'pin' => Hash::make($request->pin), // Hashear el pin
                'esta_activo' => true, // Activar el usuario por defecto
                'es_nuevo' => true,
                'perfil_editado' => false,
            ]);

            // Crear token usando Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user' => [
                    'id' => $user->id,
                    'nombre' => $user->nombre,
                    'apellidos' => $user->apellidos,
                    'correo' => $user->correo,
                    'nro_ci' => $user->nro_ci,
                    'telefono' => $user->telefono,
                    'esta_activo' => $user->esta_activo,
                    'es_nuevo' => $user->es_nuevo,
                    'perfil_editado' => $user->perfil_editado,
                ],
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor durante el registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout simple
     * @author: Rui SÃ©rgio ManÃ©
     */
    public function logout(Request $request)
    {
        try {
            // Revocar token actual
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'SesiÃ³n cerrada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesiÃ³n',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}