<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Datos mínimos para probar inicio (resultados) y recursos sin el seed completo.
 * Idempotente: no duplica ediciones ni resultados si ya existen.
 */
class BootstrapPruebasSeeder extends Seeder
{
    private const DEMO_PDFS = [
        '2022-Convocatoria BebrasCuba.pdf',
        '2023-Convocatoria BebrasCuba.pdf',
        '2024-Convocatoria BebrasCuba.pdf',
        '2025-Convocatoria BebrasCuba.pdf',
    ];

    public function run(): void
    {
        if (DB::table('provincias')->count() === 0) {
            $this->call(ProvinciaSeeder::class);
        }
        if (DB::table('municipios')->count() === 0) {
            $this->call(MunicipioSeeder::class);
        }
        if (DB::table('categorias')->count() === 0) {
            $this->call(CategoriaSeeder::class);
        }
        if (DB::table('roles')->count() === 0) {
            $this->call(RolSeeder::class);
        }
        if (DB::table('ediciones')->count() === 0) {
            $this->call(EdicionesSeeder::class);
        }
        if (DB::table('edicion_categoria')->count() === 0) {
            $this->call(EdicionCategoriaSeeder::class);
        }
        if (DB::table('resultados_provincias')->count() === 0) {
            $this->call(ResultadoProvinciaSeeder::class);
        }

        if (! DB::table('ediciones')->where('a_edicion', 2025)->exists()) {
            $this->call(Edicion2025Seeder::class);
            $this->command?->info('Edición 2025 creada (abierta).');
        }

        if (! DB::table('users')->where('correo', 'bebrascuba@uclv.cu')->exists()) {
            $this->call(AdminUserSeeder::class);
        }

        $this->asegurarPdfsDemo();
        $this->call(RecursoSeeder::class);

        $this->command?->info('Bootstrap de pruebas completado.');
    }

    private function asegurarPdfsDemo(): void
    {
        $dir = storage_path('app/public/recursos');
        File::ensureDirectoryExists($dir);

        $pdfMinimo = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            . "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
            . "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n"
            . "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n"
            . "0000000052 00000 n \n0000000101 00000 n \n"
            . "trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n";

        foreach (self::DEMO_PDFS as $filename) {
            $path = $dir . DIRECTORY_SEPARATOR . $filename;
            if (! File::exists($path)) {
                File::put($path, $pdfMinimo);
                $this->command?->info("PDF demo creado: {$filename}");
            }
        }

        if (! File::exists(public_path('storage'))) {
            try {
                \Artisan::call('storage:link');
            } catch (\Throwable) {
                // enlace opcional si public/storage ya existe o no aplica
            }
        }
    }
}
