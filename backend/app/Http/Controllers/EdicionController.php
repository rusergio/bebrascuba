<?php

namespace App\Http\Controllers;

use App\Models\Edicion;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Profesor;
use App\Models\Estudiante;
use App\Models\ResultadosProvincias;
use Illuminate\Support\Facades\DB;

class EdicionController extends Controller
{
    // Función para listar ediciones
    public function listarEdicionActual() {  
        //
        $edicionActual = Edicion::where('abierto', true)->first();
        // 
        if ($edicionActual) {
            return response() -> json($edicionActual, 200);
        }
        else {
            $data = [
                'message' => 'No hay edicion abierta',
                'status' => 404
            ];
            return response() -> json($data, 404);
        }
    }
    // Función para abrir la edición 
    public function abrirEdicion() {  
        // Verificar si ya hay una edición abierta  
        $edicionActual = Edicion::where('abierto', true)->first();  
        if ($edicionActual) {  
            return response()->json(['message' => 'Ya hay una edición abierta.'], 400);  
        }  
        // Obtener el número de la siguiente edición  
        $ultimaEdicion = Edicion::orderBy('n_edicion', 'desc')->first();  
        $n_edicion = $ultimaEdicion ? $ultimaEdicion->n_edicion + 1 : 3; // Dado que estamos en la edición 3 actualmente  
        $a_edicion = date('Y'); // Año actual   
        // Crear la nueva edición  
        $nuevaEdicion = new Edicion([  
            'n_edicion' => $n_edicion,  
            'a_edicion' => $a_edicion,  
            'fecha_inic_inscrip' => now(),  
            'abierto' => true,  
        ]);  
        $nuevaEdicion->save();  

        $profesoresActivos = Profesor::where('esta_activo', false)->get();  
        if ($profesoresActivos) {  
            $profesoresActivos->each(function ($profesor) {  
                $profesor->update([  
                    'esta_activo' => true,  
                ]);  
            });  
        } else {  
            return response()->json(['message' => 'No hay profesores activos para cerrar la edición.'], 200);  
        } 
    
        // Permitir que los usuarios (profesores) puedan iniciar sesión  
        // Aquí debes agregar la lógica para permitir el inicio de sesión de los profesores  
    
        return response()->json(['message' => 'Edición ' . $n_edicion . ' abierta exitosamente.'], 200);  
    }
    // Función para cerrar la edición 
    public function cerrarEdicion() {  
        // Verificar primero si la edición está abierta o cerrada  
        $edicionActual = Edicion::where('abierto', true)->first();  
        if (!$edicionActual) {  
            return response()->json(['message' => 'No hay edición abierta para cerrar.'], 404);  
        }  
    
        // Obtener el número de la edición actual  
        $n_edicion = $edicionActual->n_edicion;
    
        // Actualizar la edición a cerrada  
        $edicionActual->update([  
            'abierto' => false,  
        ]);  
    
        // Actualizar el estado de los profesores a inactivos  
        $profesoresActivos = Profesor::where('esta_activo', true)->get();  
        if ($profesoresActivos->count() > 0) {  
            $profesoresActivos->each(function ($profesor) {  
                $profesor->update([  
                    'esta_activo' => false,  
                ]);  
            });  
        }  
    
        // Actualizar el estado de los profesores nuevos  
        // $profesoresNuevos = Profesor::where('es_nuevo', true)->get();  
        // if ($profesoresNuevos->count() > 0) {  
        //     $profesoresNuevos->each(function ($prof) {  
        //         $prof->update([  
        //             'es_nuevo' => false,  
        //         ]);  
        //     });  
        // }  
    
        // Actualizar el estado de los estudiantes a no inscritos  
        $estudiantesInscritos = Estudiante::where('inscrito', true)->get();  
        if ($estudiantesInscritos->count() > 0) {  
            $estudiantesInscritos->each(function ($estudiante) {  
                $estudiante->update([  
                    'inscrito' => false,  
                ]);  
            });  
        }  
    
        // Responder con el número de la edición cerrada
        return response()->json(['message' => 'Edición ' . $n_edicion . ' cerrada exitosamente.'], 200);  
    }
    // Función para verificar si la edición esta abierta o cerrada
    public function isEditionOpen() { 
        // Verificar si hay una edición abierta
        $edicionActual = Edicion::where('abierto', true)->first();
        // Devolver true si la edición está abierta, de lo contrario false
        if ($edicionActual) {
            return response()->json(['is_open' => true], 200);
        } else {
            return response()->json(['is_open' => false], 200);
        }
    }
    // Función para saber o número de la edición 
    public function nroEdicion() {
        $ultimaEdicion = Edicion::orderBy('n_edicion', 'desc')->first();  
        $n_edicion = $ultimaEdicion ? $ultimaEdicion->n_edicion + 1 : 3;
        
        return response()->json(['n_edicion' => $n_edicion], 200);
    }
    // Función para obtener el total de cantidad por provincia  
    public function totalCantidadPorProvincia() {  
        // Obtener la penúltima edición  
        $penultimaEdicion = Edicion::latest()->skip(1)->first();  
        // Obtener los resultados de la penúltima edición, excluyendo la categoría 7  
        $resultados = ResultadosProvincias::where('id_edicion', $penultimaEdicion->id)  
            ->where('id_categoria', '!=', 7)  
            ->get();  
        // Calcular el total de cantidad por provincia  
        $totalPorProvincia = [];  
        foreach ($resultados as $resultado) {  
            if (!isset($totalPorProvincia[$resultado->id_provincia])) {  
                $totalPorProvincia[$resultado->id_provincia] = 0;  
            }  
            $totalPorProvincia[$resultado->id_provincia] += $resultado->cantidad;  
        }  
        return $totalPorProvincia;  
    }  
    // Función para listar los resultados provincial
    public function listarResultadosProvincias() {  
        // Obtener la penúltima edición  
        $penultimaEdicion = Edicion::latest()->skip(1)->first();  
        // Obtener los resultados de la penúltima edición ordenados por id_provincia  
        $resultados = ResultadosProvincias::with('provincia', 'categoria')  
            ->where('id_edicion', $penultimaEdicion->id)
            ->where('id_categoria', '!=', 7)    
            ->orderBy('id_provincia')  
            ->get();  
        // Preparar los datos para retornar  
        $data = [];  
        foreach ($resultados as $resultado) {  
            $provincia = $resultado->provincia;  
            $categoria = $resultado->categoria;  
            if (!isset($data[$provincia->nombre])) {  
                $data[$provincia->nombre] = [  
                    'provincia' => $provincia->nombre,  
                    'superpegues' => 0,  
                    'peque' => 0,  
                    'benjamin' => 0,  
                    'cadete' => 0,  
                    'junior' => 0,  
                    'senior' => 0,  
                    'total' => 0  
                ];  
            }  
            switch ($categoria->nombre_cuba) {  
                case 'Superpegues':  
                    $data[$provincia->nombre]['superpegues'] += $resultado->cantidad;  
                    break;  
                case 'Peque':  
                    $data[$provincia->nombre]['peque'] += $resultado->cantidad;  
                    break;  
                case 'Benjamín':  
                    $data[$provincia->nombre]['benjamin'] += $resultado->cantidad;  
                    break;  
                case 'Cadete':  
                    $data[$provincia->nombre]['cadete'] += $resultado->cantidad;  
                    break;  
                case 'Junior':  
                    $data[$provincia->nombre]['junior'] += $resultado->cantidad;  
                    break;  
                case 'Senior':  
                    $data[$provincia->nombre]['senior'] += $resultado->cantidad;  
                    break;  
            }  
            $data[$provincia->nombre]['total'] += $resultado->cantidad;  
        }  
        return array_values($data);  
    }
    // Función para calcular el total por categoria 
    public function totalCantidadPorCategoria() {  
        // Obtener la penúltima edición  
        $penultimaEdicion = Edicion::latest()->skip(1)->first();  

        // Obtener los resultados de la penúltima edición, excluyendo los que tienen categoría 7  
        $resultados = ResultadosProvincias::whereNotNull('id_categoria')  
            ->where('id_categoria', '!=', 7)  
            ->where('id_edicion', $penultimaEdicion->id)  
            ->get();  

        // Calcular el total de cantidad por categoría  
        $totalPorCategoria = [  
            'superpegues' => 0,  
            'peques' => 0,  
            'benjamin' => 0,  
            'cadete' => 0,  
            'junior' => 0,  
            'senior' => 0,  
            'total' => 0  
        ];  

        foreach ($resultados as $resultado) {  
            switch ($resultado->id_categoria) {  
                case 1:  
                    $totalPorCategoria['superpegues'] += $resultado->cantidad;  
                    break;  
                case 2:  
                    $totalPorCategoria['peques'] += $resultado->cantidad;  
                    break;  
                case 3:  
                    $totalPorCategoria['benjamin'] += $resultado->cantidad;  
                    break;  
                case 4:  
                    $totalPorCategoria['cadete'] += $resultado->cantidad;  
                    break;  
                case 5:  
                    $totalPorCategoria['junior'] += $resultado->cantidad;  
                    break;  
                case 6:  
                    $totalPorCategoria['senior'] += $resultado->cantidad;  
                    break;  
            }  
            $totalPorCategoria['total'] += $resultado->cantidad;  
        }  

        return $totalPorCategoria;  
    }
    // Función para actualizar las fechas de la edición 
    public function marcarFechasEdicion(Request $request) {
        // Validación de los datos 
        $request->validate([
            'fecha_convocatoria' => 'required|date',
            'fecha_inic_preinscrip' => 'required|date',
            'fecha_fin_preinscrip' => 'required|date',
            'fecha_inic_inscripVille' => 'required|date',
        ]);

        // Verificar si la edición esta abierta 
        $edicionActual = Edicion::where('abierto', true)->first();  
        if (!$edicionActual) {  
            return response()->json(['message' => 'No puede actualizar las fechas'], 404);  
        }
        
        // Actualizar las fechas 
        $edicionActual->update([  
            'fecha_convocatoria' => $request->fecha_convocatoria,  
            'fecha_inic_preinscrip' => $request->fecha_inic_preinscrip,  
            'fecha_fin_preinscrip' => $request->fecha_fin_preinscrip,  
            'fecha_inic_inscripVille' => $request->fecha_inic_inscripVille,  
        ]);

        return reponse()->json(['message' => 'Fecha actualizadas con éxito'], 200);
    }
    // Función para actualizar las fechas considerados importantes 
    public function marcarFechasImportantes(Request $request) {
        $request->validate([
            'fecha_resultados' => 'required|date',
            'fecha_inic_realiz' => 'required|date',
            'fecha_fin_realiz' => 'required|date',
            
        ]);
        // Verificar si la edición esta abierta 
        $edicionActual = Edicion::where('abierto', true)->first();  
        if (!$edicionActual) {  
            return response()->json(['message' => 'No puede actualizar las fechas'], 404);  
        }
        // Actualizar las fechas 
        $edicionActual->update([  
            'fecha_resultados' => $request->fecha_resultados,  
            'fecha_inic_realiz' => $request->fecha_inic_realiz,  
            'fecha_fin_realiz' => $request->fecha_fin_realiz,  
        ]);
        return reponse()->json(['message' => 'Fecha actualizadas con éxito'], 200);
    }
}
