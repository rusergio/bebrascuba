<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RecursoSeeder extends Seeder
{
    /**
     * Lee dinámicamente los archivos en storage/app/public/recursos
     * e inserta/actualiza entradas en la tabla recursos según el año detectado.
     */
    public function run(): void
    {
        // Listar archivos dentro de 'public/recursos'
        $files = Storage::files('public/recursos');

        foreach ($files as $file) {
            // $file viene como 'public/recursos/archivo.pdf'
            $relativePath = str_starts_with($file, 'public/') ? substr($file, 7) : $file; // 'recursos/archivo.pdf'
            $filename = basename($file);
            $nombre = pathinfo($filename, PATHINFO_FILENAME);

            // Intentar extraer el año (primera aparición de 20XX en el nombre)
            $anio = null;
            if (preg_match('/\b(20\d{2})\b/u', $filename, $m)) {
                $anio = (int)$m[1];
            }

            $edicionId = null;
            if ($anio) {
                $edicionId = DB::table('ediciones')->where('a_edicion', $anio)->value('id');
                if (!$edicionId) {
                    // Si no existe edición para el año detectado, registrar como recurso general
                    if (isset($this->command)) {
                        $this->command->warn("No existe edición para el año {$anio}. Guardando como recurso general: {$filename}");
                    }
                }
            } else {
                // Si no se detecta año, registrar como recurso general
                if (isset($this->command)) {
                    $this->command->info("Recurso sin año detectable, guardando como recurso general: {$filename}");
                }
            }

            // Generar descripción según las reglas:
            // - Si tiene año: eliminar año y guión que le sigue
            // - Si no tiene año: mantener todo el nombre
            $descripcion = $nombre; // Por defecto, usar todo el nombre
            if ($anio) {
                // Buscar el patrón del año seguido de guión y eliminarlo
                $descripcion = preg_replace('/\b' . $anio . '\s*-?\s*/u', '', $nombre);
                // Limpiar espacios extra al inicio
                $descripcion = ltrim($descripcion);
            }

            // Upsert por (edicion, nombre)
            $query = DB::table('recursos')->where('nombre', $nombre);
            if ($edicionId === null) {
                $query->whereNull('edicion');
            } else {
                $query->where('edicion', $edicionId);
            }
            $existing = $query->first();

            $data = [
                'descripcion' => $descripcion,
                'archivo_path' => $relativePath,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if ($existing) {
                DB::table('recursos')->where('id', $existing->id)->update($data);
                if (isset($this->command)) {
                    $this->command->info("Recurso actualizado: {$nombre} ({$anio})");
                }
            } else {
                DB::table('recursos')->insert(array_merge([
                    'edicion' => $edicionId,
                    'nombre' => $nombre,
                ], $data));
                if (isset($this->command)) {
                    $this->command->info("Recurso insertado: {$nombre} ({$anio})");
                }
            }
        }
    }
}


