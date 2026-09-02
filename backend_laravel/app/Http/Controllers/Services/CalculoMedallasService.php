<?php

namespace App\Services;

class CalculoMedallasService
{
    public function calcularPorCategoria(string $categoria, array $participantes): array
    {
        $participantesOrdenados = collect($participantes)
            ->map(function ($participante) {
                $participante['puntuacion'] = (int) ($participante['puntuacion'] ?? 0);
                return $participante;
            })
            ->sortByDesc('puntuacion')
            ->values()
            ->toArray();

        $minimoBronce = $this->minimoParaMedalla($categoria);

        $validos = array_values(array_filter($participantesOrdenados, function ($participante) use ($minimoBronce) {
            return $participante['puntuacion'] >= $minimoBronce;
        }));

        $cantidadValidos = count($validos);

        if ($cantidadValidos === 0) {
            return [
                'categoria' => $categoria,
                'cantidad_participantes' => count($participantes),
                'cantidad_validos' => 0,
                'oro_desde' => null,
                'plata_desde' => null,
                'bronce_desde' => $minimoBronce,
                'participantes' => $this->asignarParticipacion($participantesOrdenados),
            ];
        }

        /*
         * Regla base:
         * Oro: 1/6 de los válidos.
         * Plata: 1/2 de los válidos.
         *
         * Mejora:
         * 1. Se calcula Oro por corte.
         * 2. Se amplía Oro a todos los empatados en ese corte.
         * 3. Se retiran los Oro.
         * 4. Se recalcula Plata sobre los restantes.
         * 5. Se amplía Plata a todos los empatados en ese nuevo corte.
         * 6. El resto de válidos queda como Bronce.
         */

        $cantidadOroObjetivo = max(1, (int) floor($cantidadValidos / 6));

        $oroDesde = $this->obtenerPuntajeCorte($validos, $cantidadOroObjetivo);

        $oros = array_values(array_filter($validos, function ($participante) use ($oroDesde) {
            return $participante['puntuacion'] >= $oroDesde;
        }));

        $restantesDespuesOro = array_values(array_filter($validos, function ($participante) use ($oroDesde) {
            return $participante['puntuacion'] < $oroDesde;
        }));

        $cantidadRestante = count($restantesDespuesOro);

        $plataDesde = null;

        if ($cantidadRestante > 0) {
            $cantidadPlataObjetivo = max(1, (int) floor($cantidadValidos / 2) - count($oros));

            if ($cantidadPlataObjetivo < 1) {
                $cantidadPlataObjetivo = max(1, (int) floor($cantidadRestante / 2));
            }

            $plataDesde = $this->obtenerPuntajeCorte($restantesDespuesOro, $cantidadPlataObjetivo);
        }

        $participantesCalculados = [];

        foreach ($participantesOrdenados as $participante) {
            $puntaje = $participante['puntuacion'];

            if ($puntaje >= $oroDesde) {
                $medalla = 'Oro';
            } elseif ($plataDesde !== null && $puntaje >= $plataDesde && $puntaje < $oroDesde) {
                $medalla = 'Plata';
            } elseif ($puntaje >= $minimoBronce) {
                $medalla = 'Bronce';
            } else {
                $medalla = 'Participa';
            }

            $participante['medalla_calculada'] = $medalla;
            $participantesCalculados[] = $participante;
        }

        return [
            'categoria' => $categoria,
            'cantidad_participantes' => count($participantes),
            'cantidad_validos' => $cantidadValidos,
            'cantidad_oro_objetivo' => $cantidadOroObjetivo,
            'cantidad_oro_real' => count($oros),
            'cantidad_restante_despues_oro' => $cantidadRestante,
            'oro_desde' => $oroDesde,
            'plata_desde' => $plataDesde,
            'bronce_desde' => $minimoBronce,
            'participantes' => $participantesCalculados,
        ];
    }

    private function obtenerPuntajeCorte(array $validos, int $cantidadObjetivo): int
    {
        $indice = max(0, $cantidadObjetivo - 1);

        if (!isset($validos[$indice])) {
            $indice = count($validos) - 1;
        }

        return (int) $validos[$indice]['puntuacion'];
    }

    private function minimoParaMedalla(string $categoria): int
    {
        return match ($this->normalizarCategoria($categoria)) {
            'superpeque', 'peque', 'benjamin' => 50,
            'cadete', 'junior', 'senior' => 60,
            default => 50,
        };
    }

    private function asignarParticipacion(array $participantes): array
    {
        return array_map(function ($participante) {
            $participante['medalla_calculada'] = 'Participa';
            return $participante;
        }, $participantes);
    }

    private function normalizarCategoria(string $categoria): string
    {
        $categoria = mb_strtolower($categoria, 'UTF-8');

        $buscar = ['á', 'é', 'í', 'ó', 'ú', 'ñ'];
        $reemplazar = ['a', 'e', 'i', 'o', 'u', 'n'];

        $categoria = str_replace($buscar, $reemplazar, $categoria);

        if (str_contains($categoria, 'super')) {
            return 'superpeque';
        }

        if (str_contains($categoria, 'peque') || str_contains($categoria, 'primary')) {
            return 'peque';
        }

        if (str_contains($categoria, 'benjamin')) {
            return 'benjamin';
        }

        if (str_contains($categoria, 'cadete')) {
            return 'cadete';
        }

        if (str_contains($categoria, 'junior')) {
            return 'junior';
        }

        if (str_contains($categoria, 'senior')) {
            return 'senior';
        }

        return $categoria;
    }
}