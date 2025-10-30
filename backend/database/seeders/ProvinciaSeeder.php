<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProvinciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $provincias = [
            ['codigo' => 21, 'nombre' => 'Pinar del Río'],
            ['codigo' => 22, 'nombre' => 'Artemisa'],
            ['codigo' => 23, 'nombre' => 'La Habana'],
            ['codigo' => 24, 'nombre' => 'Mayabeque'],
            ['codigo' => 25, 'nombre' => 'Matanzas'],
            ['codigo' => 26, 'nombre' => 'Villa Clara'],
            ['codigo' => 27, 'nombre' => 'Cienfuegos'],
            ['codigo' => 28, 'nombre' => 'Sancti Spíritus'],
            ['codigo' => 29, 'nombre' => 'Ciego de Ávila'],
            ['codigo' => 30, 'nombre' => 'Camagüey'],
            ['codigo' => 31, 'nombre' => 'Las Tunas'],
            ['codigo' => 32, 'nombre' => 'Holguín'],
            ['codigo' => 33, 'nombre' => 'Granma'],
            ['codigo' => 34, 'nombre' => 'Santiago de Cuba'],
            ['codigo' => 35, 'nombre' => 'Guantánamo'],
            ['codigo' => 40, 'nombre' => 'Isla de la Juventud']
        ];

        foreach ($provincias as $provincia) {
            DB::table('provincias')->insert($provincia);
        }
    }
}
