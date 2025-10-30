<?php

namespace App\Http\Controllers;

use App\Models\Escuela;
use App\Models\Municipio;
use Illuminate\Http\Request;
use App\Http\Controllers\EscuelaController;

class EscuelaController extends Controller
{
    /**
     * Función para listar escuela dado el codigo del municipio
     * @author: Rui Sérgio Mané
     */
    public function index($cdgo_municipio)
    {
        $escuelas = Escuela::where('cdgo_municipio', $cdgo_municipio)
            ->whereNotNull('poblado')  // Asegura que solo escuelas con 'poblado' se incluyan
            ->with('subsistema')  // Cargar la relación con subsistema
            ->get(['id', 'nombre', 'subsistema_id', 'poblado']);
    
        if ($escuelas->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron las escuelas',
                'status' => 404
            ], 404);
        }
    
        $escuelasFormatted = $escuelas->map(function ($escuela) {
            return [
                'label' => "{$escuela->nombre} / {$escuela->subsistema->nombre} / {$escuela->poblado}",
                'value' => (string) $escuela->id  // Usamos 'id' como identificador único
            ];
        });
    
        return response()->json($escuelasFormatted, 200);
    }

    /**
     * Función para registrar una nueva escuela
     * @author: Rui Sérgio Mané
     */

    public function registrarEscuela(Request $request)
    {
        $escuela = Escuela::create([
            'codigo' => $request->input('codigo_escuela'),
            'nombre' => $request->input('nombre_escuela'),
            'telefono' => $request->input('telefono'),
            'cdgo_municipio' => $request->input('cdgo_municipio'),
            'poblado' => $request->input('poblado'),
            'subsistema_id' => $request->input('subsistema'),
            'activo' => true,
            'validado' => false,
        ]);
        return response()->json($escuela, 201);
    }
}
