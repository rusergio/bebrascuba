<?php

namespace App\Http\Concerns;

use App\Models\Edicion;
use App\Models\Profesor;
use Illuminate\Http\Request;

trait ResuelveEdicionResultados
{
    protected function edicionPorNumero(int $nEdicion): ?Edicion
    {
        return Edicion::where('n_edicion', $nEdicion)->first();
    }

    protected function idEdicionInterno(int $nEdicion): ?int
    {
        return $this->edicionPorNumero($nEdicion)?->id;
    }

    protected function profesorDelRequest(Request $request, int $idProfesor): Profesor
    {
        $profesor = Profesor::findOrFail($idProfesor);
        $user = $request->user();

        if ($user && (int) $profesor->user_id !== (int) $user->id) {
            $roles = $user->roles()->where('roles.estado', true)->pluck('rol')->toArray();
            $esCoordinador = !empty(array_intersect($roles, [
                'Administrador',
                'Coordinador Nacional',
                'Coordinador Asistente',
            ]));

            if (!$esCoordinador) {
                abort(403, 'No tienes permiso para consultar datos de otro profesor.');
            }
        }

        return $profesor;
    }

    protected function medallasPermitidas(): array
    {
        return ['Oro', 'Plata', 'Bronce', 'Participa', 'Sin medalla'];
    }
}
