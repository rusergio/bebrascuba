<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EdicionCategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $relaciones = [
            // Edición 2022 (id 1) - Benjamín, Cadete, Junior, Senior
            ['edicion' => 1, 'id_categoria' => 3], // Benjamín
            ['edicion' => 1, 'id_categoria' => 4], // Cadete
            ['edicion' => 1, 'id_categoria' => 5], // Junior
            ['edicion' => 1, 'id_categoria' => 6], // Senior

            // Edición 2023 (id 2) - Peque, Benjamín, Cadete, Junior, Senior
            ['edicion' => 2, 'id_categoria' => 2], // Peque
            ['edicion' => 2, 'id_categoria' => 3], // Benjamín
            ['edicion' => 2, 'id_categoria' => 4], // Cadete
            ['edicion' => 2, 'id_categoria' => 5], // Junior
            ['edicion' => 2, 'id_categoria' => 6], // Senior

            // Edición 2024 (id 3) - SuperPeque, Peque, Benjamín, Cadete, Junior, Senior
            ['edicion' => 3, 'id_categoria' => 1], // SuperPeque
            ['edicion' => 3, 'id_categoria' => 2], // Peque
            ['edicion' => 3, 'id_categoria' => 3], // Benjamín
            ['edicion' => 3, 'id_categoria' => 4], // Cadete
            ['edicion' => 3, 'id_categoria' => 5], // Junior
            ['edicion' => 3, 'id_categoria' => 6], // Senior
        ];

        foreach ($relaciones as $relacion) {
            DB::table('edicion_categoria')->insert($relacion);
        }
    }
}