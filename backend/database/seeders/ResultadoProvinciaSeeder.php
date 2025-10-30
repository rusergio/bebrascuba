<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResultadoProvinciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $resultados = [
// Datos para la edición número 1 del 2022
//prov P del R
            ['id_edicion' => 1, 'id_provincia' => 1, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 1, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 1, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 1, 'id_categoria' => 6, 'cantidad' => 3], // Senior
//prov Artemisa
            ['id_edicion' => 1, 'id_provincia' => 2, 'id_categoria' => 3, 'cantidad' => 8], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 2, 'id_categoria' => 4, 'cantidad' => 8], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 2, 'id_categoria' => 5, 'cantidad' => 6], // Junior
            ['id_edicion' => 1, 'id_provincia' => 2, 'id_categoria' => 6, 'cantidad' => 12], // Senior
//prov La H
            ['id_edicion' => 1, 'id_provincia' => 3, 'id_categoria' => 3, 'cantidad' => 9], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 3, 'id_categoria' => 4, 'cantidad' => 2], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 3, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 3, 'id_categoria' => 6, 'cantidad' => 17], // Senior
//prov Mayabeque
            ['id_edicion' => 1, 'id_provincia' => 4, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 4, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 4, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 4, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Mtzas
            ['id_edicion' => 1, 'id_provincia' => 5, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 5, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 5, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 5, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov VC
            ['id_edicion' => 1, 'id_provincia' => 6, 'id_categoria' => 3, 'cantidad' => 33], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 6, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 6, 'id_categoria' => 5, 'cantidad' => 21], // Junior
            ['id_edicion' => 1, 'id_provincia' => 6, 'id_categoria' => 6, 'cantidad' => 25], // Senior
//prov Cfgos
            ['id_edicion' => 1, 'id_provincia' => 7, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 7, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 7, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 7, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov SS
            ['id_edicion' => 1, 'id_provincia' => 8, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 8, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 8, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 8, 'id_categoria' => 6, 'cantidad' => 1], // Senior
//prov CA
            ['id_edicion' => 1, 'id_provincia' => 9, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 9, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 9, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 9, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Cam
            ['id_edicion' => 1, 'id_provincia' => 10, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 10, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 10, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 10, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov LT
            ['id_edicion' => 1, 'id_provincia' => 11, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 11, 'id_categoria' => 4, 'cantidad' => 2], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 11, 'id_categoria' => 5, 'cantidad' => 30], // Junior
            ['id_edicion' => 1, 'id_provincia' => 11, 'id_categoria' => 6, 'cantidad' => 43], // Senior
//prov Hol
            ['id_edicion' => 1, 'id_provincia' => 12, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 12, 'id_categoria' => 4, 'cantidad' => 3], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 12, 'id_categoria' => 5, 'cantidad' => 5], // Junior
            ['id_edicion' => 1, 'id_provincia' => 12, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Granma
            ['id_edicion' => 1, 'id_provincia' => 13, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 13, 'id_categoria' => 4, 'cantidad' => 4], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 13, 'id_categoria' => 5, 'cantidad' => 5], // Junior
            ['id_edicion' => 1, 'id_provincia' => 13, 'id_categoria' => 6, 'cantidad' => 9], // Senior
//prov SCuba
            ['id_edicion' => 1, 'id_provincia' => 14, 'id_categoria' => 3, 'cantidad' => 1], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 14, 'id_categoria' => 4, 'cantidad' => 3], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 14, 'id_categoria' => 5, 'cantidad' => 1], // Junior
            ['id_edicion' => 1, 'id_provincia' => 14, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Gtmo
            ['id_edicion' => 1, 'id_provincia' => 15, 'id_categoria' => 3, 'cantidad' => 22], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 15, 'id_categoria' => 4, 'cantidad' => 11], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 15, 'id_categoria' => 5, 'cantidad' => 24], // Junior
            ['id_edicion' => 1, 'id_provincia' => 15, 'id_categoria' => 6, 'cantidad' => 18], // Senior
//prov I de la J
            ['id_edicion' => 1, 'id_provincia' => 16, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 1, 'id_provincia' => 16, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 1, 'id_provincia' => 16, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 1, 'id_provincia' => 16, 'id_categoria' => 6, 'cantidad' => 0], // Senior

// Datos para la edición número 2 del 2023
//prov P del R
            ['id_edicion' => 2, 'id_provincia' => 1, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 1, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 1, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 1, 'id_categoria' => 5, 'cantidad' => 7], // Junior
            ['id_edicion' => 2, 'id_provincia' => 1, 'id_categoria' => 6, 'cantidad' => 21], // Senior
//prov Artemisa
            ['id_edicion' => 2, 'id_provincia' => 2, 'id_categoria' => 2, 'cantidad' => 1], // Peque
            ['id_edicion' => 2, 'id_provincia' => 2, 'id_categoria' => 3, 'cantidad' => 14], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 2, 'id_categoria' => 4, 'cantidad' => 6], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 2, 'id_categoria' => 5, 'cantidad' => 93], // Junior
            ['id_edicion' => 2, 'id_provincia' => 2, 'id_categoria' => 6, 'cantidad' => 14], // Senior
//prov La Habana
            ['id_edicion' => 2, 'id_provincia' => 3, 'id_categoria' => 2, 'cantidad' => 4], // Peque
            ['id_edicion' => 2, 'id_provincia' => 3, 'id_categoria' => 3, 'cantidad' => 13], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 3, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 3, 'id_categoria' => 5, 'cantidad' => 4], // Junior
            ['id_edicion' => 2, 'id_provincia' => 3, 'id_categoria' => 6, 'cantidad' => 9], // Senior
//prov Mayabeque
            ['id_edicion' => 2, 'id_provincia' => 4, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 4, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 4, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 4, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 2, 'id_provincia' => 4, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Mtzas
            ['id_edicion' => 2, 'id_provincia' => 5, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 5, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 5, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 5, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 2, 'id_provincia' => 5, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov VC
            ['id_edicion' => 2, 'id_provincia' => 6, 'id_categoria' => 2, 'cantidad' => 34], // Peque
            ['id_edicion' => 2, 'id_provincia' => 6, 'id_categoria' => 3, 'cantidad' => 62], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 6, 'id_categoria' => 4, 'cantidad' => 105], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 6, 'id_categoria' => 5, 'cantidad' => 97], // Junior
            ['id_edicion' => 2, 'id_provincia' => 6, 'id_categoria' => 6, 'cantidad' => 43], // Senior
//prov Cfgos
            ['id_edicion' => 2, 'id_provincia' => 7, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 7, 'id_categoria' => 3, 'cantidad' => 1], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 7, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 7, 'id_categoria' => 5, 'cantidad' => 26], // Junior
            ['id_edicion' => 2, 'id_provincia' => 7, 'id_categoria' => 6, 'cantidad' => 20], // Senior
//prov SS
            ['id_edicion' => 2, 'id_provincia' => 8, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 8, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 8, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 8, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 2, 'id_provincia' => 8, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov CA
            ['id_edicion' => 2, 'id_provincia' => 9, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 9, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 9, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 9, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 2, 'id_provincia' => 9, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Camaguey
            ['id_edicion' => 2, 'id_provincia' => 10, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 10, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 10, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 10, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 2, 'id_provincia' => 10, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov LT
            ['id_edicion' => 2, 'id_provincia' => 11, 'id_categoria' => 2, 'cantidad' => 1], // Peque
            ['id_edicion' => 2, 'id_provincia' => 11, 'id_categoria' => 3, 'cantidad' => 3], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 11, 'id_categoria' => 4, 'cantidad' => 1], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 11, 'id_categoria' => 5, 'cantidad' => 52], // Junior
            ['id_edicion' => 2, 'id_provincia' => 11, 'id_categoria' => 6, 'cantidad' => 27], // Senior  
//prov Holguin
            ['id_edicion' => 2, 'id_provincia' => 12, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 12, 'id_categoria' => 3, 'cantidad' => 3], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 12, 'id_categoria' => 4, 'cantidad' => 13], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 12, 'id_categoria' => 5, 'cantidad' => 1], // Junior
            ['id_edicion' => 2, 'id_provincia' => 12, 'id_categoria' => 6, 'cantidad' => 3], // Senior
//prov Granma
            ['id_edicion' => 2, 'id_provincia' => 13, 'id_categoria' => 2, 'cantidad' => 1], // Peque
            ['id_edicion' => 2, 'id_provincia' => 13, 'id_categoria' => 3, 'cantidad' => 6], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 13, 'id_categoria' => 4, 'cantidad' => 2], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 13, 'id_categoria' => 5, 'cantidad' => 9], // Junior
            ['id_edicion' => 2, 'id_provincia' => 13, 'id_categoria' => 6, 'cantidad' => 13], // Senior
//prov SCuba
            ['id_edicion' => 2, 'id_provincia' => 14, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 14, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 14, 'id_categoria' => 4, 'cantidad' => 4], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 14, 'id_categoria' => 5, 'cantidad' => 2], // Junior
            ['id_edicion' => 2, 'id_provincia' => 14, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Guantanamo
            ['id_edicion' => 2, 'id_provincia' => 15, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 15, 'id_categoria' => 3, 'cantidad' => 2], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 15, 'id_categoria' => 4, 'cantidad' => 2], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 15, 'id_categoria' => 5, 'cantidad' => 9], // Junior
            ['id_edicion' => 2, 'id_provincia' => 15, 'id_categoria' => 6, 'cantidad' => 9], // Senior
//prov I de la J
            ['id_edicion' => 2, 'id_provincia' => 16, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 2, 'id_provincia' => 16, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 2, 'id_provincia' => 16, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 2, 'id_provincia' => 16, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 2, 'id_provincia' => 16, 'id_categoria' => 6, 'cantidad' => 0], // Senior

// Datos para la edición número 3 del 2024
//prov P del R
            ['id_edicion' => 3, 'id_provincia' => 1, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 1, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 1, 'id_categoria' => 3, 'cantidad' => 2], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 1, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 1, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 1, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Artemisa
            ['id_edicion' => 3, 'id_provincia' => 2, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 2, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 2, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 2, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 2, 'id_categoria' => 5, 'cantidad' => 33], // Junior
            ['id_edicion' => 3, 'id_provincia' => 2, 'id_categoria' => 6, 'cantidad' => 22], // Senior
//prov La Habana
            ['id_edicion' => 3, 'id_provincia' => 3, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 3, 'id_categoria' => 2, 'cantidad' => 3], // Peque
            ['id_edicion' => 3, 'id_provincia' => 3, 'id_categoria' => 3, 'cantidad' => 19], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 3, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 3, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 3, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Mayabeque
            ['id_edicion' => 3, 'id_provincia' => 4, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 4, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 4, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 4, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 4, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 4, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Matanzas
            ['id_edicion' => 3, 'id_provincia' => 5, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 5, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 5, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 5, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 5, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 5, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Villa Clara
            ['id_edicion' => 3, 'id_provincia' => 6, 'id_categoria' => 1, 'cantidad' => 35], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 6, 'id_categoria' => 2, 'cantidad' => 43], // Peque
            ['id_edicion' => 3, 'id_provincia' => 6, 'id_categoria' => 3, 'cantidad' => 115], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 6, 'id_categoria' => 4, 'cantidad' => 80], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 6, 'id_categoria' => 5, 'cantidad' => 45], // Junior
            ['id_edicion' => 3, 'id_provincia' => 6, 'id_categoria' => 6, 'cantidad' => 62], // Senior
//prov Cienfuegos
            ['id_edicion' => 3, 'id_provincia' => 7, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 7, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 7, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 7, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 7, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 7, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Sancti Spíritus
            ['id_edicion' => 3, 'id_provincia' => 8, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 8, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 8, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 8, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 8, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 8, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Ciego de Ávila
            ['id_edicion' => 3, 'id_provincia' => 9, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 9, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 9, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 9, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 9, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 9, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Camagüey
            ['id_edicion' => 3, 'id_provincia' => 10, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 10, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 10, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 10, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 10, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 10, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Las Tunas
            ['id_edicion' => 3, 'id_provincia' => 11, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 11, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 11, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 11, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 11, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 11, 'id_categoria' => 6, 'cantidad' => 0], // Senior
//prov Holguín
            ['id_edicion' => 3, 'id_provincia' => 12, 'id_categoria' => 1, 'cantidad' => 1], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 12, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 12, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 12, 'id_categoria' => 4, 'cantidad' => 1], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 12, 'id_categoria' => 5, 'cantidad' => 1], // Junior
            ['id_edicion' => 3, 'id_provincia' => 12, 'id_categoria' => 6, 'cantidad' => 2], // Senior
//prov Granma
            ['id_edicion' => 3, 'id_provincia' => 13, 'id_categoria' => 1, 'cantidad' => 19], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 13, 'id_categoria' => 2, 'cantidad' => 28], // Peque
            ['id_edicion' => 3, 'id_provincia' => 13, 'id_categoria' => 3, 'cantidad' => 48], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 13, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 13, 'id_categoria' => 5, 'cantidad' => 2], // Junior
            ['id_edicion' => 3, 'id_provincia' => 13, 'id_categoria' => 6, 'cantidad' => 2], // Senior
//prov Santiago de Cuba
            ['id_edicion' => 3, 'id_provincia' => 14, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 14, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 14, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 14, 'id_categoria' => 4, 'cantidad' => 5], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 14, 'id_categoria' => 5, 'cantidad' => 5], // Junior
            ['id_edicion' => 3, 'id_provincia' => 14, 'id_categoria' => 6, 'cantidad' => 1], // Senior
//prov Guantánamo
            ['id_edicion' => 3, 'id_provincia' => 15, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 15, 'id_categoria' => 2, 'cantidad' => 1], // Peque
            ['id_edicion' => 3, 'id_provincia' => 15, 'id_categoria' => 3, 'cantidad' => 1], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 15, 'id_categoria' => 4, 'cantidad' => 2], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 15, 'id_categoria' => 5, 'cantidad' => 6], // Junior
            ['id_edicion' => 3, 'id_provincia' => 15, 'id_categoria' => 6, 'cantidad' => 11], // Senior
//prov Isla de la Juventud
            ['id_edicion' => 3, 'id_provincia' => 16, 'id_categoria' => 1, 'cantidad' => 0], // SuperPeque
            ['id_edicion' => 3, 'id_provincia' => 16, 'id_categoria' => 2, 'cantidad' => 0], // Peque
            ['id_edicion' => 3, 'id_provincia' => 16, 'id_categoria' => 3, 'cantidad' => 0], // Benjamín
            ['id_edicion' => 3, 'id_provincia' => 16, 'id_categoria' => 4, 'cantidad' => 0], // Cadete
            ['id_edicion' => 3, 'id_provincia' => 16, 'id_categoria' => 5, 'cantidad' => 0], // Junior
            ['id_edicion' => 3, 'id_provincia' => 16, 'id_categoria' => 6, 'cantidad' => 0] // Senior

//Datos de la edición 4 del 2025 - poner , al final línea anterior.

        ]; 
        foreach ($resultados as $resultado) {
            DB::table('resultados_provincias')->insert($resultado);
        }
    }
}



