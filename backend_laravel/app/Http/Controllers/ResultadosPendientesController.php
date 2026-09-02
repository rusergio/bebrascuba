<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class ResultadosPendientesController extends Controller
{
    public function index()
    {
        $pendientes = DB::table('resultados_pendientes')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(function ($p) {
                $p->categoria_nombre = match ((int) $p->id_categoria) {
                    1 => 'SuperPeque',
                    2 => 'Peque',
                    3 => 'Benjamín',
                    4 => 'Cadete',
                    5 => 'Junior',
                    6 => 'Senior',
                    7 => 'Sin categoría',
                    default => 'Sin categoría',
                };

                return $p;
            });

        return view('pendientes.index', [
            'pendientes' => $pendientes,
        ]);
    }

    public function show($id)
    {
        $pendiente = DB::table('resultados_pendientes')
            ->where('id', $id)
            ->first();

        if (!$pendiente) {
            abort(404, 'Resultado pendiente no encontrado.');
        }

        $pendiente->categoria_nombre = match ((int) $pendiente->id_categoria) {
            1 => 'SuperPeque',
            2 => 'Peque',
            3 => 'Benjamín',
            4 => 'Cadete',
            5 => 'Junior',
            6 => 'Senior',
            7 => 'Sin categoría',
            default => 'Sin categoría',
        };

        return view('pendientes.show', [
            'pendiente' => $pendiente,
        ]);
    }

    public function marcarRevisado($id)
    {
        DB::table('resultados_pendientes')
            ->where('id', $id)
            ->update([
                'estado' => 'revisado',
                'updated_at' => now(),
            ]);

        return redirect('/coordinador/resultados-pendientes/' . $id);
    }
}
