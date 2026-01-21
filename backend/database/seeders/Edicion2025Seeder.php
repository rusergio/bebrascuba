<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class Edicion2025Seeder extends Seeder
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
                'n_edicion' => 4,
                'a_edicion' => 2025,
                'fecha_convocatoria' => '01-10-2025',
                'fecha_inic_preinscrip' => '10-11-2025',
                'fecha_fin_preinscrip' => '30-11-2025',
                'fecha_inic_inscripVille' => '01-12-2025',
                'fecha_inic_realiz' => '01-12-2025',
                'fecha_fin_realiz' => '19-12-2025',
                'fecha_resultados' => '23-01-2026',
                'abierto' => true,
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