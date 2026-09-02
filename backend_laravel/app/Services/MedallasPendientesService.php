<?php

namespace App\Services;

use App\Models\ResultadoPendiente;
use Illuminate\Support\Facades\DB;

class MedallasPendientesService
{
    public function calcularParaEdicion(int $nEdicion): array
    {
        $servicio = new CalculoMedallasService();
        $resultado = [];

        $categorias = DB::table('categorias')->where('id', '!=', 7)->orderBy('id')->get();

        foreach ($categorias as $categoria) {
            $pendientes = ResultadoPendiente::where('edicion', $nEdicion)
                ->where('id_categoria', $categoria->id)
                ->whereNotNull('puntuacion')
                ->get();

            if ($pendientes->isEmpty()) {
                continue;
            }

            $participantes = $pendientes->map(fn ($r) => [
                'id_pendiente' => $r->id,
                'puntuacion' => (int) $r->puntuacion,
            ])->values()->all();

            $calculo = $servicio->calcularPorCategoria($categoria->nombre_cuba, $participantes);

            foreach ($calculo['participantes'] as $participante) {
                ResultadoPendiente::where('id', $participante['id_pendiente'])->update([
                    'medalla' => $participante['medalla_calculada'],
                ]);
            }

            $resultado[$categoria->nombre_cuba] = [
                'participantes' => count($participantes),
                'validos' => $calculo['cantidad_validos'],
                'resumen_medallas' => collect($calculo['participantes'])
                    ->countBy('medalla_calculada')
                    ->all(),
            ];
        }

        return $resultado;
    }
}
