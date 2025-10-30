<?php

namespace App\Http\Controllers;
use App\Models\SubsistemaEscuela;

use Illuminate\Http\Request;

class SubsistemaController extends Controller
{
    //
    public function listarSubsistemas()
    {
        try {
            $subsistemas = SubsistemaEscuela::select('id', 'nombre')->get();
            return response()->json($subsistemas);
            if ($subsistemas->isEmpty()) {
                return response()->json([
                    'message' => 'No se encontraron los subsistemas',
                    'status' => 404
                ], 404);
            }
            return response()->json($subsistemas);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al listar los subsistemas',
                'status' => 500
            ], 500);
        }
    }
}
