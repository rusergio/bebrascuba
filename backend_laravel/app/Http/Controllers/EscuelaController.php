<?php

namespace App\Http\Controllers;

use App\Models\Escuela;
use App\Models\Municipio;
use App\Models\Provincia;
use Illuminate\Http\Request;

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
            return response()->json([], 200);
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
     * Listado detallado de escuelas por municipio (coordinación municipal).
     */
    public function listarDetalle($cdgo_municipio)
    {
        try {
            $municipio = Municipio::where('codigo', $cdgo_municipio)->first();

            $escuelas = Escuela::where('cdgo_municipio', $cdgo_municipio)
                ->with('subsistema')
                ->orderBy('nombre')
                ->get();

            $data = $escuelas->map(function ($escuela) use ($municipio) {
                return [
                    'id' => $escuela->id,
                    'codigo' => $escuela->codigo,
                    'nombre' => $escuela->nombre,
                    'telefono' => $escuela->telefono,
                    'poblado' => $escuela->poblado,
                    'subsistema' => $escuela->subsistema?->nombre ?? 'Sin subsistema',
                    'subsistema_id' => $escuela->subsistema_id,
                    'activo' => (bool) $escuela->activo,
                    'validado' => (bool) $escuela->validado,
                    'municipio' => $municipio?->nombre ?? null,
                    'cdgo_municipio' => $escuela->cdgo_municipio,
                ];
            });

            return response()->json([
                'success' => true,
                'municipio' => $municipio?->nombre,
                'cdgo_municipio' => (int) $cdgo_municipio,
                'escuelas' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar escuelas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Listado detallado de escuelas por provincia (coordinación provincial).
     */
    public function listarDetallePorProvincia($cdgo_provincia)
    {
        try {
            $provincia = Provincia::where('codigo', $cdgo_provincia)->first();

            if (!$provincia) {
                return response()->json([
                    'success' => false,
                    'message' => 'Provincia no encontrada',
                    'escuelas' => [],
                ], 404);
            }

            $municipios = Municipio::where('cdgo_provincia', $cdgo_provincia)
                ->get(['codigo', 'nombre']);

            $municipiosMap = $municipios->pluck('nombre', 'codigo');
            $codigosMunicipio = $municipios->pluck('codigo');

            $escuelas = Escuela::whereIn('cdgo_municipio', $codigosMunicipio)
                ->with('subsistema')
                ->get()
                ->sortBy([
                    fn ($escuela) => $municipiosMap[$escuela->cdgo_municipio] ?? '',
                    fn ($escuela) => $escuela->nombre,
                ])
                ->values();

            $data = $escuelas->map(function ($escuela) use ($municipiosMap) {
                return [
                    'id' => $escuela->id,
                    'codigo' => $escuela->codigo,
                    'nombre' => $escuela->nombre,
                    'telefono' => $escuela->telefono,
                    'poblado' => $escuela->poblado,
                    'subsistema' => $escuela->subsistema?->nombre ?? 'Sin subsistema',
                    'subsistema_id' => $escuela->subsistema_id,
                    'activo' => (bool) $escuela->activo,
                    'validado' => (bool) $escuela->validado,
                    'municipio' => $municipiosMap[$escuela->cdgo_municipio] ?? null,
                    'cdgo_municipio' => $escuela->cdgo_municipio,
                ];
            });

            return response()->json([
                'success' => true,
                'provincia' => $provincia->nombre,
                'cdgo_provincia' => (int) $cdgo_provincia,
                'escuelas' => $data,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al listar escuelas: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Función para registrar una nueva escuela
     * @author: Rui Sérgio Mané
     */

    public function registrarEscuela(Request $request)
    {
        $validated = $request->validate([
            'codigo_escuela' => 'nullable|string|max:10',
            'nombre_escuela' => 'required|string|max:50',
            'telefono' => 'nullable|string|max:20',
            'cdgo_municipio' => 'required|integer|exists:municipios,codigo',
            'poblado' => 'required|string|max:50',
            'subsistema' => 'required|integer|exists:subsistema_escuelas,id',
        ], [
            'nombre_escuela.required' => 'El nombre de la escuela es obligatorio',
            'cdgo_municipio.required' => 'Debe indicar el municipio',
            'cdgo_municipio.exists' => 'El municipio no es válido',
            'poblado.required' => 'El poblado es obligatorio',
            'subsistema.required' => 'Debe seleccionar el subsistema',
            'subsistema.exists' => 'El subsistema no es válido',
        ]);

        $escuela = Escuela::create([
            'codigo' => $validated['codigo_escuela'] ?? null,
            'nombre' => $validated['nombre_escuela'],
            'telefono' => $validated['telefono'] ?? null,
            'cdgo_municipio' => $validated['cdgo_municipio'],
            'poblado' => $validated['poblado'],
            'subsistema_id' => $validated['subsistema'],
            'activo' => true,
            'validado' => false,
        ]);

        return response()->json($escuela, 201);
    }

    /**
     * Aprobar / validar una escuela pendiente.
     */
    public function validarEscuela(Request $request, $id)
    {
        $escuela = Escuela::findOrFail($id);

        if ($escuela->validado) {
            return response()->json([
                'success' => true,
                'message' => 'La escuela ya estaba validada',
                'escuela' => [
                    'id' => $escuela->id,
                    'nombre' => $escuela->nombre,
                    'validado' => true,
                ],
            ], 200);
        }

        $territorio = \App\Support\TerritorioCoord::forUser($request->user());
        if ($territorio) {
            $municipio = Municipio::where('codigo', $escuela->cdgo_municipio)->first();
            if (!$municipio || (int) $municipio->cdgo_provincia !== (int) $territorio['provincia_codigo']) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puede validar escuelas fuera de su provincia',
                ], 403);
            }
            if (!empty($territorio['municipio_codigo'])
                && (int) $municipio->codigo !== (int) $territorio['municipio_codigo']) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puede validar escuelas fuera de su municipio',
                ], 403);
            }
        }

        $escuela->validado = true;
        $escuela->activo = true;
        $escuela->save();

        return response()->json([
            'success' => true,
            'message' => 'Escuela aprobada correctamente',
            'escuela' => [
                'id' => $escuela->id,
                'nombre' => $escuela->nombre,
                'validado' => true,
            ],
        ], 200);
    }
}
