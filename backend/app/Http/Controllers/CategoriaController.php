<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;


class CategoriaController extends Controller
{
    // función para listar todas las categorias
    public function listarCategorias() {  
        try {  
            $categorias = Categoria::where('edad_inferior', '>=', 0)  
            ->where('edad_superior', '>', 0)  
            ->get(['id', 'nombre_cuba']);  

            if ($categorias->isEmpty()) {  
                throw new Exception('No se encontraron las categorías');  
            }  

            return response()->json($categorias, 200);  
        } catch (Exception $e) {  
            $data = [  
                'message' => $e->getMessage(),  
                'status' => 404  
            ];  
            return response()->json($data, 404);  
        }  
    }
}
