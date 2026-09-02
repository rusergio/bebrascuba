<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EdicionesSeeder extends Seeder
{
    /**
     * Convierte fecha de formato DD-MM-YYYY a YYYY-MM-DD
     * Soporta ambos formatos automáticamente
     *
     * @param string $fecha
     * @return string
     */
    private function convertirFecha($fecha)
    {
        // Si ya está en formato ISO (YYYY-MM-DD), retornar tal cual
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            return $fecha;
        }
        
        // Si está en formato DD-MM-YYYY, convertir a YYYY-MM-DD
        if (preg_match('/^\d{2}-\d{2}-\d{4}$/', $fecha)) {
            return Carbon::createFromFormat('d-m-Y', $fecha)->format('Y-m-d');
        }
        
        // Si no coincide con ningún formato, intentar parsear automáticamente
        return Carbon::parse($fecha)->format('Y-m-d');
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Ahora puedes usar formato cubano (DD-MM-YYYY) o chino (YYYY-MM-DD)
        // El método convertirFecha() lo ajustará automáticamente
        $ediciones = [
            [
                'n_edicion' => 1,
                'a_edicion' => 2022,
                'fecha_convocatoria' => '12-11-2022',
                'fecha_inic_preinscrip' => '25-11-2022',
                'fecha_fin_preinscrip' => '05-12-2022',
                'fecha_inic_inscripVille' => '12-12-2022',
                'fecha_inic_realiz' => '13-12-2022',
                'fecha_fin_realiz' => '23-12-2022',
                'fecha_resultados' => '06-01-2023',
                'abierto' => false,
            ],
            [
                'n_edicion' => 2,
                'a_edicion' => 2023,
                'fecha_convocatoria' => '07-11-2023',
                'fecha_inic_preinscrip' => '07-11-2023',
                'fecha_fin_preinscrip' => '29-11-2023',
                'fecha_inic_inscripVille' => '01-12-2023',
                'fecha_inic_realiz' => '04-12-2023',
                'fecha_fin_realiz' => '05-12-2023',
                'fecha_resultados' => '22-01-2024',
                'abierto' => false,
            ],
            [
                'n_edicion' => 3,
                'a_edicion' => 2024,
                'fecha_convocatoria' => '06-11-2024',
                'fecha_inic_preinscrip' => '11-11-2024',
                'fecha_fin_preinscrip' => '09-12-2024',
                'fecha_inic_inscripVille' => '01-12-2024',
                'fecha_inic_realiz' => '09-12-2024',
                'fecha_fin_realiz' => '17-01-2025',
                'fecha_resultados' => '07-02-2025',
                'abierto' => false,
            ]
        ];

        // Convertir todas las fechas al formato ISO antes de insertar
        foreach ($ediciones as &$edicion) {
            foreach ($edicion as $key => $value) {
                if (strpos($key, 'fecha_') === 0 && is_string($value)) {
                    $edicion[$key] = $this->convertirFecha($value);
                }
            }
            DB::table('ediciones')->insert($edicion);
        }
    }
}