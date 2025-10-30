<?php

// Librerías
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

// Modelos
use App\Models\Rol;
use App\Models\RoleUser;
use App\Models\User;
use App\Models\Edicion;
use App\Models\Estudiante;
use App\Models\EstudianteEscuela;

class RoleController extends Controller
{

    // Función para listar roles
    public function listarRoles() {
        try {
            $roles = Rol::select('id', 'rol', 'descripcion', 'estado')->get();
            
            if ($roles->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron roles disponibles',
                    'data' => []
                ], 200);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Roles listados correctamente',
                'data' => $roles
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor: No se pueden listar los roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
