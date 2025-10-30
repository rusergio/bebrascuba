<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categorias = [
            [
                'nombre_cuba' => 'SuperPeque',
                'nombre_bebras' => 'PrePrimary',
                'grado_inferior' => 1,
                'grado_superior' => 2,
                'edad_inferior' => 5,
                'edad_superior' => 8
            ],
            [
                'nombre_cuba' => 'Peque',
                'nombre_bebras' => 'Primary',
                'grado_inferior' => 3,
                'grado_superior' => 4,
                'edad_inferior' => 8,
                'edad_superior' => 10
            ],
            [
                'nombre_cuba' => 'Benjamín',
                'nombre_bebras' => 'Benjamins',
                'grado_inferior' => 5,
                'grado_superior' => 6,
                'edad_inferior' => 10,
                'edad_superior' => 12
            ],
            [
                'nombre_cuba' => 'Cadete',
                'nombre_bebras' => 'Cadets',
                'grado_inferior' => 7,
                'grado_superior' => 8,
                'edad_inferior' => 12,
                'edad_superior' => 14
            ],
[
                'nombre_cuba' => 'Junior',
                'nombre_bebras' => 'Juniors',
                'grado_inferior' => 9,
                'grado_superior' => 10,
                'edad_inferior' => 14,
                'edad_superior' => 16
            ],
[
                'nombre_cuba' => 'Senior',
                'nombre_bebras' => 'Seniors',
                'grado_inferior' => 11,
                'grado_superior' => 12,
                'edad_inferior' => 16,
                'edad_superior' => 19
            ],
[
                'nombre_cuba' => 'NOcategoria',
                'nombre_bebras' => 'NONAME',
                'grado_inferior' => 0,
                'grado_superior' => 0,
                'edad_inferior' => 0,
                'edad_superior' => 0
            ]

        ];

        foreach ($categorias as $categoria) {
            DB::table('categorias')->insert($categoria);
        }
    }
}
