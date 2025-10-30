<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UniversidadSeeder extends Seeder
{
    private $universidades = [
        // Universidad | Provincia
        ['Universidad de Pinar del Río Hermanos Saiz Montes de Oca', 'Pinar del Río'],
        ['Universidad de Artemisa Julio Díaz González', 'Artemisa'],
        ['Universidad de La Habana', 'La Habana'],
        ['Universidad Tecnológica de La Habana José Antonio Echeverría', 'La Habana'],
        ['Universidad de Ciencias Pedagógicas Enrique José Varona', 'La Habana'],
        ['Universidad de las Ciencias de la Cultura Física y el Deporte Manuel Fajardo', 'La Habana'],
        ['Universidad Agraria de La Habana Fructuoso Rodríguez Pérez', 'La Habana'],
        ['Universidad de las Ciencias Informáticas', 'La Habana'],
        ['Universidad de Matanzas', 'Matanzas'],
        ['Universidad Central "Marta Abreu" de Las Villas', 'Villa Clara'],
        ['Universidad de Cienfuegos Carlos Rafael Rodríguez', 'Cienfuegos'],
        ['Universidad de Sancti Spíritus José Martí Pérez', 'Sancti Spíritus'],
        ['Universidad de Ciego de Ávila Máximo Gómez Báez', 'Ciego de Ávila'],
        ['Universidad de Camagüey Ignacio Agramonte Loynaz', 'Camagüey'],
        ['Universidad Vladímir Ilich Lenin de Las Tunas', 'Las Tunas'],
        ['Universidad de Holguín Oscar Lucero Moya', 'Holguín'],
        ['Universidad de Moa Dr. Núñez Jiménez', 'Holguín'],
        ['Universidad de Granma', 'Granma'],
        ['Universidad de Oriente', 'Santiago de Cuba'],
        ['Universidad de Guantánamo', 'Guantánamo'],
        ['Universidad de la Isla de la Juventud Jesús Montané Oropesa', 'Isla de la Juventud'],
        ['Universidad de las Artes', 'La Habana'],
        ['Universidad de Ciencias Médicas de Pinar del Río', 'Pinar del Río'],
        ['Universidad de Ciencias Médicas de La Habana', 'La Habana'],
        ['Escuela Latinoamericana de Medicina', 'La Habana'],
        ['Universidad de Ciencias Médicas de Matanzas', 'Matanzas'],
        ['Universidad de Ciencias Médicas de Villa Clara', 'Villa Clara'],
        ['Universidad de Ciencias Médicas de Cienfuegos', 'Cienfuegos'],
        ['Universidad de Ciencias Médicas de Sancti Spíritus', 'Sancti Spíritus'],
        ['Universidad de Ciencias Médicas de Ciego de Ávila', 'Ciego de Ávila'],
        ['Universidad de Ciencias Médicas de Camagüey', 'Camagüey'],
        ['Universidad de Ciencias Médicas de Las Tunas', 'Las Tunas'],
        ['Universidad de Ciencias Médicas de Holguín', 'Holguín'],
        ['Universidad de Ciencias Médicas de Granma', 'Granma'],
        ['Universidad de Ciencias Médicas de Santiago de Cuba', 'Santiago de Cuba'],
        ['Universidad de Ciencias Médicas de Guantánamo', 'Guantánamo']
    ];
      
    public function run()
    {
        // Obtener mapeo de provincias [nombre => id]
        $provincias = DB::table('provincias')->pluck('id', 'nombre');
        
        $universidadesData = [];
        foreach ($this->universidades as $universidad) {
            [$nombreUniv, $nombreProv] = $universidad;
            
            if (!isset($provincias[$nombreProv])) {
                throw new \Exception("Provincia no encontrada: $nombreProv");
            }
            
            $universidadesData[] = [
                'nombre' => $nombreUniv,
                'provincia_id' => $provincias[$nombreProv],
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        DB::table('universidades')->insert($universidadesData);
    }
}