<?php

namespace App\Http\Controllers;

use App\Models\Provincia;
use Illuminate\Http\Request;


class ProvinciaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        try {  
            $provincias = Provincia::all(['codigo', 'nombre']);  
            
            if ($provincias->isEmpty()) {  
                throw new Exception('No se encontraron las provincias');  
            }  
            
            return response()->json($provincias, 200);  
        } catch (Exception $e) {  
            $data = [  
                'message' => $e->getMessage(),  
                'status' => 404  
            ];  
            return response()->json($data, 404);  
        }  
    }
}
