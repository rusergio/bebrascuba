<?php

namespace App\Http\Controllers;

use App\Models\PlantillaCertificado;
use Illuminate\Http\Request;

class PlantillaCertificadoController extends Controller
{
    public function index()
    {
        $plantillas = PlantillaCertificado::where('activa', true)
            ->orderBy('tipo')
            ->orderBy('medalla')
            ->get();

        return view('plantillas-certificados', compact('plantillas'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|string|max:50',
            'categoria' => 'nullable|string|max:50',
            'medalla' => 'nullable|string|max:50',
            'archivo' => 'required|file|mimes:jpg,jpeg,png',
        ]);

        $archivo = $request->file('archivo');

        $ruta = $archivo->store('certificados/plantillas', 'public');

        $plantilla = PlantillaCertificado::create([
            'nombre' => $request->nombre,
            'tipo' => $request->tipo,
            'categoria' => $request->categoria,
            'medalla' => $request->medalla,
            'ruta_archivo' => $ruta,
            'activa' => true,
        ]);

        return redirect('/plantillas-certificados')
            ->with('success', 'Plantilla subida correctamente.');
    }

    public function desactivar($id)
    {
        $plantilla = PlantillaCertificado::findOrFail($id);
        $plantilla->activa = false;
        $plantilla->save();

        return redirect('/plantillas-certificados')
            ->with('success', 'Plantilla desactivada correctamente.');
    }
}
