<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Recurso;
use Illuminate\Http\UploadedFile;
use App\Models\Edicion;

class RecursoController extends Controller {

    // Función para listar recursos por edicion
    public function listarRecursosPorEdicion($edicion) {
        $recursos = Recurso::where('edicion', $edicion)->get();
        return response()->json($recursos);
    }

    // Función para listar recursos
    public function listarRecursos() {
        //
        $recursos = Recurso::all();

        if ($recursos->isEmpty()) {
            $data = [
                'message' => 'No se encontraron los recursos',
                'status' => 404
            ];
            return response() -> json($data, 404);
        }
        return response() ->json($recursos, 200);
    }
    // Función para guardar el archivo
    public function guardarArchivo(Request $request)  {  
        // Validación de los datos  
        $request->validate([  
            'nombre' => 'required|string|max:100',  
            'descripcion' => 'nullable|string|max:255',  
            'archivo' => 'required|file|mimes:pdf|max:2048', // Asegúrate de que sea un archivo PDF  
        ]);  

        // Almacenar el archivo  
        $archivo = $request->file('archivo');
        $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
        $path = $archivo->storeAs('recursos', $nombreArchivo, 'public');

        // Verificar primero si la edición está abierta o cerrada  
        $edicionActual = Edicion::where('abierto', true)->first();  
        if (!$edicionActual) {  
            return response()->json(['message' => 'No se puede subir ningun recurso'], 404);  
        }  

        $n_edicion = $edicionActual->n_edicion;

        // Crear un nuevo recurso en la base de datos  
        $recurso = Recurso::create([  
            // 'edicion' => $request->edicion,  
            'nombre' => $request->nombre,  
            'descripcion' => $request->descripcion,  
            'archivo_path' => $path,  
            'edicion' => $n_edicion,
        ]);  

        return response()->json($recurso, 201);  
    } 

    // Función para descargar el archivo dado el dirección del archivo
    public function descargarRecurso($archivo)  {  
        $rutaArchivo = storage_path('app/public/recursos/' . $archivo);  

        if (file_exists($rutaArchivo)) {  
            return response()->download($rutaArchivo);  
        }  

        return abort(404, 'Archivo no encontrado');  
    }

    // Función para visualizar el archivo en el navegador
    public function verRecurso($archivo) {
        $rutaArchivo = storage_path('app/public/recursos/' . $archivo);

        if (file_exists($rutaArchivo)) {
            return response()->file($rutaArchivo, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $archivo . '"'
            ]);
        }

        return abort(404, 'Archivo no encontrado');
    }

    // Función para actualizar recurso
    public function actualizarRecurso(Request $request, $id) {
        // Validación de los datos
        $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'archivo' => 'nullable|file|mimes:pdf|max:2048', // Archivo opcional
        ]);

        // Buscar el recurso existente
        $recurso = Recurso::findOrFail($id);

        // Actualizar nombre y descripción
        $recurso->nombre = $request->nombre;
        $recurso->descripcion = $request->descripcion;

        // Si se proporciona un nuevo archivo
        if ($request->hasFile('archivo')) {
            // Eliminar el archivo anterior si existe
            $archivoAnterior = storage_path('app/public/' . $recurso->archivo_path);
            if (file_exists($archivoAnterior)) {
                unlink($archivoAnterior);
            }

            // Guardar el nuevo archivo
            $archivo = $request->file('archivo');
            $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
            $path = $archivo->storeAs('recursos', $nombreArchivo, 'public');
            $recurso->archivo_path = $path;
        }

        // Guardar los cambios
        $recurso->save();

        return response()->json([
            'message' => 'Recurso actualizado con éxito',
            'data' => $recurso,
            'status' => 200
        ], 200);
    }

    // Función para eliminar recurso dado el id de recurso
    public function eliminarRecurso($id_recurso) {

        // Verificar si el recurso exista
        $recurso = Recurso::findOrFail($id_recurso);

        $recurso->delete();

        $data = [  
            'message' => 'Recurso eliminado con exito',  
            'status' => 200  
        ];   
        return response()->json($data, 200); 
    }
}