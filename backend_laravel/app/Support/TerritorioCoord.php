<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class TerritorioCoord
{
    /**
     * Territorio activo del coordinador provincial/municipal desde coord_regionales.
     *
     * @return array{
     *   provincia_id: int,
     *   provincia_codigo: int|string,
     *   provincia_nombre: string,
     *   municipio_id: int|null,
     *   municipio_codigo: int|string|null,
     *   municipio_nombre: string|null,
     *   edicion_id: int,
     *   ambito: 'provincial'|'municipal'
     * }|null
     */
    public static function forUser(?User $user): ?array
    {
        if (!$user) {
            return null;
        }

        $coord = DB::table('coord_regionales as cr')
            ->join('provincias as p', 'cr.provincia_id', '=', 'p.id')
            ->leftJoin('municipios as m', 'cr.municipio_id', '=', 'm.id')
            ->where('cr.user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('cr.fecha_fin')
                    ->orWhere('cr.fecha_fin', '>=', now()->toDateString());
            })
            ->orderByDesc('cr.edicion_id')
            ->select(
                'p.id as provincia_id',
                'p.codigo as provincia_codigo',
                'p.nombre as provincia_nombre',
                'm.id as municipio_id',
                'm.codigo as municipio_codigo',
                'm.nombre as municipio_nombre',
                'cr.edicion_id'
            )
            ->first();

        if (!$coord) {
            return null;
        }

        return [
            'provincia_id' => (int) $coord->provincia_id,
            'provincia_codigo' => $coord->provincia_codigo,
            'provincia_nombre' => $coord->provincia_nombre,
            'municipio_id' => $coord->municipio_id ? (int) $coord->municipio_id : null,
            'municipio_codigo' => $coord->municipio_codigo,
            'municipio_nombre' => $coord->municipio_nombre,
            'edicion_id' => (int) $coord->edicion_id,
            'ambito' => $coord->municipio_id ? 'municipal' : 'provincial',
        ];
    }
}
