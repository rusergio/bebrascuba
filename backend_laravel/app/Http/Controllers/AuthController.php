<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

use App\Models\Edicion;
use App\Models\User;
use App\Models\RoleUser;
use App\Models\Profesor;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            // Validar los datos de entrada
            $request->validate([
                'correo' => 'required|email',
                'contrasenia' => 'required|string',
            ]);

            // Buscar el usuario por correo
            $user = User::where('correo', $request->correo)->first();

            // Verificar si el usuario existe y la contraseña es correcta
            if (!$user || !Hash::check($request->contrasenia, $user->contrasenia)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            // Obtener los roles del usuario
            $roles = $user->roles()->select('roles.id', 'rol', 'descripcion', 'estado')->get();

            // Crear el token de acceso usando Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // Verificar si el usuario es un profesor
            $tieneRolProfesor = $roles->where('rol', 'Profesor')->first();
            if ($tieneRolProfesor) {
                // Obtener la edición abierta
                $edicionAbierta = Edicion::where('abierto', true)->first();
                // Verificar si el profesor está activo
                $profesor = Profesor::where('correo', $user->correo)->first();
                
                if ($edicionAbierta) {
                    // Comprobar si hay una edición abierta
                    if ($profesor && $profesor->esta_activo==false) {
                        return response()->json([
                            'success' => true,
                            'message' => 'Bienvenido Profesor',
                            'user' => [
                                'id' => $user->id,
                                'nombre' => $profesor->nombre,
                                'apellidos' => $profesor->apellidos,
                                'correo' => $user->correo,
                                'roles' => $roles
                            ],
                            'token' => $token,
                        ]);
                    } else {
                        return response()->json([
                            'success' => false,
                            'error' => 'El profesor no está activo'
                        ], 403);
                    }
                } else { 
                    return response()->json([
                        'success' => false,
                        'error' => 'No hay edición abierta'
                    ], 403);
                }
            }

            // Manejo para otros roles
            $tieneRolAdmin = $roles->where('rol', 'Administrador')->first();
            if ($tieneRolAdmin) {
                $profesor = Profesor::where('correo', $user->correo)->first();
                return response()->json([
                    'success' => true,
                    'message' => 'Bienvenido Administrador',
                    'user' => [
                        'id' => $user->id,
                        'nombre' => $profesor ? $profesor->nombre : $user->nombre,
                        'apellidos' => $profesor ? $profesor->apellidos : $user->apellidos,
                        'correo' => $user->correo,
                        'roles' => $roles
                    ],
                    'token' => $token
                ], 200);
            }

            $tieneRolCoordNacional = $roles->where('rol', 'Coordinador Nacional')->first();
            if ($tieneRolCoordNacional) {
                $profesor = Profesor::where('correo', $user->correo)->first();
                return response()->json([
                    'success' => true,
                    'message' => 'Bienvenido Coordinador Nacional',
                    'user' => [
                        'id' => $user->id,
                        'nombre' => $profesor ? $profesor->nombre : $user->nombre,
                        'apellidos' => $profesor ? $profesor->apellidos : $user->apellidos,
                        'correo' => $user->correo,
                        'roles' => $roles
                    ],
                    'token' => $token,    
                ], 200);
            }


        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor durante el login',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function logout(Request $request)
    {
        try {
            // Revocar el token actual
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Sesión cerrada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
