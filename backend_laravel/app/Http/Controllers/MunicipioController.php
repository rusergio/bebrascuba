<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use Illuminate\Http\Request;
use App\Http\Controllers\MunicipioController;

class MunicipioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($cdgo_provincia)
    {
        //
        $municipios = Municipio::where('cdgo_provincia', $cdgo_provincia) -> get(['codigo', 'nombre']);

        if ($municipios -> isEmpty()) {
            $data = [
                'message' => 'No se encontraron los municipios',
                'status' => 404
            ];
            return response() -> json($data, 404);
        }

        return response() -> json($municipios, 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Municipio $municipio)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Municipio $municipio)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Municipio $municipio)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Municipio $municipio)
    {
        //
    }
}
