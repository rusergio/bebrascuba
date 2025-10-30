<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubsistemaSeeder extends Seeder
{
    private $subsistemas = [
        'ESBEC',
        'ESBEC-ETP',
        'ESBEC-IPUEC',
        'ESBEC-IPUEC-ETP',
        'ESBU',
        'ESBU-ETP',
        'ESBU-IPU',
        'ESBU-IPUEC',
        'Escuela Oficios',
        'Escuela Especial',
        'Escuela Pedagógica',
        'Escuela de Arte',
        'Escuela de Teatro',
        'Escuela de Ballet',
        'ETP',
        'IPA',
        'IPI',
        'IPU',
        'IPU-ETP',
        'IPUEC',
        'IPVCE',
        'Primaria Rural',
        'Primaria Rural-ESBU',
        'Primaria Urbana',
        'Primaria Urbana-ESBU',
        'EIDE',
        'ENU',
        'Centro Mixto',
        'Universidad',
	'Otro'
    ];

    public function run()
    {
        $subsistemasData = [];
        foreach ($this->subsistemas as $subsistema) {
            $subsistemasData[] = [
                'nombre' => $subsistema,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        DB::table('subsistema_escuelas')->insert($subsistemasData);
    }
}
