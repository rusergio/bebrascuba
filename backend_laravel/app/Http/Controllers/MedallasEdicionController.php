<?php

namespace App\Http\Controllers;

use App\Services\CalculoMedallasService;
use App\Services\MedallasPendientesService;
use Illuminate\Support\Facades\DB;

class MedallasEdicionController extends Controller
{
    public function calcularYActualizar($edicion)
    {
        $servicio = new CalculoMedallasService();

        $categorias = DB::table('categorias')
            ->orderBy('id')
            ->get();

        $resultado = [];

        foreach ($categorias as $categoria) {
            $participantes = DB::table('estudiante_escuela')
                ->join('estudiantes', 'estudiantes.id', '=', 'estudiante_escuela.id_estudiante')
                ->where('estudiante_escuela.edicion', $edicion)
                ->where('estudiante_escuela.id_categoria', $categoria->id)
                ->whereNotNull('estudiante_escuela.puntuacion')
                ->select(
                    'estudiantes.id as id_estudiante',
                    'estudiantes.nombre as nombre_estudiante',
                    'estudiante_escuela.puntuacion'
                )
                ->get()
                ->map(function ($item) {
                    return [
                        'id_estudiante' => $item->id_estudiante,
                        'nombre_estudiante' => $item->nombre_estudiante,
                        'puntuacion' => $item->puntuacion,
                    ];
                })
                ->toArray();

            if (count($participantes) === 0) {
                continue;
            }

            $calculo = $servicio->calcularPorCategoria($categoria->nombre_cuba, $participantes);

            foreach ($calculo['participantes'] as $participante) {
                DB::table('estudiante_escuela')
                    ->where('edicion', $edicion)
                    ->where('id_estudiante', $participante['id_estudiante'])
                    ->update([
                        'medalla' => $participante['medalla_calculada'],
                        'updated_at' => now(),
                    ]);
            }

            $resultado[$categoria->nombre_cuba] = [
                'cantidad_participantes' => $calculo['cantidad_participantes'],
                'cantidad_validos' => $calculo['cantidad_validos'],
                'oro_desde' => $calculo['oro_desde'],
                'plata_desde' => $calculo['plata_desde'],
                'bronce_desde' => $calculo['bronce_desde'],
                'resumen_medallas' => $this->resumirMedallas($calculo['participantes']),
            ];
        }

        return response()->json([
            'message' => 'Medallas calculadas y actualizadas correctamente.',
            'edicion' => $edicion,
            'resultado' => $resultado,
        ]);
    }

    /** Recalcula medallas sobre resultados_pendientes (antes de integrar al histórico). */
    public function calcularPendientes(int $edicion)
    {
        $resultado = (new MedallasPendientesService())->calcularParaEdicion($edicion);

        return response()->json([
            'success' => true,
            'message' => 'Medallas calculadas sobre resultados pendientes.',
            'edicion' => $edicion,
            'resultado' => $resultado,
        ]);
    }

    public function resumen($edicion)
    {
        $resumen = DB::table('estudiante_escuela')
            ->join('categorias', 'categorias.id', '=', 'estudiante_escuela.id_categoria')
            ->where('estudiante_escuela.edicion', $edicion)
            ->whereNotNull('estudiante_escuela.puntuacion')
            ->select(
                'categorias.nombre_cuba as categoria',
                'estudiante_escuela.medalla',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('categorias.nombre_cuba', 'estudiante_escuela.medalla')
            ->orderBy('categorias.nombre_cuba')
            ->orderBy('estudiante_escuela.medalla')
            ->get();

        return response()->json([
            'message' => 'Resumen de medallas por edición.',
            'edicion' => $edicion,
            'resumen' => $resumen,
        ]);
    }

    public function listado($edicion)
    {
        $listado = DB::table('estudiante_escuela')
            ->join('estudiantes', 'estudiantes.id', '=', 'estudiante_escuela.id_estudiante')
            ->join('categorias', 'categorias.id', '=', 'estudiante_escuela.id_categoria')
            ->leftJoin('escuelas', 'escuelas.id', '=', 'estudiante_escuela.id_escuela')
            ->where('estudiante_escuela.edicion', $edicion)
            ->whereNotNull('estudiante_escuela.puntuacion')
            ->select(
                'estudiantes.nombre as estudiante',
                'categorias.nombre_cuba as categoria',
                'escuelas.nombre as escuela',
                'estudiante_escuela.puntuacion',
                'estudiante_escuela.medalla'
            )
            ->orderBy('categorias.nombre_cuba')
            ->orderByDesc('estudiante_escuela.puntuacion')
            ->get();

        return response()->json([
            'message' => 'Listado de medallas otorgadas.',
            'edicion' => $edicion,
            'listado' => $listado,
        ]);
    }

    private function resumirMedallas(array $participantes): array
    {
        $resumen = [
            'Oro' => 0,
            'Plata' => 0,
            'Bronce' => 0,
            'Participa' => 0,
        ];

        foreach ($participantes as $participante) {
            $medalla = $participante['medalla_calculada'] ?? 'Participa';

            if (!isset($resumen[$medalla])) {
                $resumen[$medalla] = 0;
            }

            $resumen[$medalla]++;
        }

        return $resumen;
    }
}