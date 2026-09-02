<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RepararVinculosEstudiantes extends Command
{
    protected $signature = 'bebras:reparar-vinculos-estudiantes
                            {--edicion= : ID de edición (por defecto: edición abierta)}
                            {--fix : Aplicar correcciones automáticas cuando hay un solo profesor candidato}
                            {--dry-run : Solo mostrar diagnóstico (por defecto)}';

    protected $description = 'Diagnostica y repara vínculos incorrectos en profesor_estudiante (bug id_profesor vs user_id)';

    public function handle(): int
    {
        $edicionId = $this->option('edicion');

        if (!$edicionId) {
            $edicion = DB::table('ediciones')->where('abierto', true)->first();
            if (!$edicion) {
                $edicion = DB::table('ediciones')->orderByDesc('id')->first();
            }
            if (!$edicion) {
                $this->error('No hay ediciones en la base de datos.');
                return self::FAILURE;
            }
            $edicionId = $edicion->id;
        }

        $this->info("Edición analizada: ID {$edicionId}");
        $fix = $this->option('fix') && !$this->option('dry-run');

        if (!$fix) {
            $this->warn('Modo diagnóstico. Usa --fix para aplicar correcciones automáticas.');
        }

        $sinVinculo = $this->diagnosticarSinVinculo((int) $edicionId);
        $vinculoIncorrecto = $this->diagnosticarVinculoIncorrecto((int) $edicionId);

        $reparados = 0;

        if ($fix) {
            $reparados += $this->repararSinVinculo((int) $edicionId, $sinVinculo);
            $reparados += $this->repararVinculoIncorrecto((int) $edicionId, $vinculoIncorrecto);
            $this->info("Registros reparados/creados: {$reparados}");
        }

        $this->newLine();
        $this->info('Resumen:');
        $this->line("  - Estudiantes sin vínculo profesor_estudiante: " . count($sinVinculo));
        $this->line("  - Vínculos con profesor de otra escuela: " . count($vinculoIncorrecto));

        return self::SUCCESS;
    }

    private function diagnosticarSinVinculo(int $edicionId): array
    {
        $rows = DB::select("
            SELECT e.id AS estudiante_id, e.nro_ci, e.nombre, ee.id_escuela, esc.nombre AS escuela
            FROM estudiante_escuela ee
            JOIN estudiantes e ON e.id = ee.id_estudiante
            JOIN escuelas esc ON esc.id = ee.id_escuela
            LEFT JOIN profesor_estudiante pe ON pe.id_estudiante = e.id
                AND pe.edicion = ee.edicion
                AND pe.deleted_at IS NULL
            WHERE ee.edicion = ?
              AND pe.id IS NULL
            ORDER BY esc.nombre, e.nombre
        ", [$edicionId]);

        if (count($rows) > 0) {
            $this->newLine();
            $this->warn('Estudiantes SIN vínculo en profesor_estudiante:');
            foreach ($rows as $r) {
                $this->line("  [{$r->estudiante_id}] {$r->nombre} (CI: {$r->nro_ci}) — {$r->escuela}");
            }
        }

        return $rows;
    }

    private function diagnosticarVinculoIncorrecto(int $edicionId): array
    {
        $rows = DB::select("
            SELECT
                pe.id AS vinculo_id,
                e.id AS estudiante_id,
                e.nro_ci,
                e.nombre AS estudiante,
                pe.id_profesor AS profesor_actual_id,
                u.nombre AS profesor_actual,
                ee.id_escuela AS escuela_estudiante,
                esc_est.nombre AS escuela_estudiante_nombre,
                pe_esc.id_escuela AS escuela_profesor
            FROM profesor_estudiante pe
            JOIN estudiantes e ON e.id = pe.id_estudiante
            JOIN profesores p ON p.id = pe.id_profesor
            JOIN users u ON u.id = p.user_id
            JOIN estudiante_escuela ee ON ee.id_estudiante = e.id AND ee.edicion = pe.edicion
            JOIN escuelas esc_est ON esc_est.id = ee.id_escuela
            LEFT JOIN profesor_escuela pe_esc ON pe_esc.id_profesor = p.id
                AND pe_esc.edicion = pe.edicion
                AND pe_esc.deleted_at IS NULL
            WHERE pe.edicion = ?
              AND pe.deleted_at IS NULL
              AND (pe_esc.id_escuela IS NULL OR pe_esc.id_escuela != ee.id_escuela)
            ORDER BY esc_est.nombre, e.nombre
        ", [$edicionId]);

        if (count($rows) > 0) {
            $this->newLine();
            $this->warn('Vínculos INCORRECTOS (profesor no pertenece a la escuela del estudiante):');
            foreach ($rows as $r) {
                $this->line("  [{$r->estudiante_id}] {$r->estudiante} → Prof. {$r->profesor_actual} (ID {$r->profesor_actual_id}), escuela estudiante: {$r->escuela_estudiante_nombre}");
            }
        }

        return $rows;
    }

    private function profesorCandidatoUnico(int $escuelaId, int $edicionId): ?int
    {
        $profesores = DB::table('profesor_escuela as pe')
            ->join('profesores as p', 'p.id', '=', 'pe.id_profesor')
            ->where('pe.id_escuela', $escuelaId)
            ->where('pe.edicion', $edicionId)
            ->whereNull('pe.deleted_at')
            ->where('p.esta_activo', true)
            ->pluck('p.id')
            ->unique()
            ->values();

        return $profesores->count() === 1 ? (int) $profesores->first() : null;
    }

    private function repararSinVinculo(int $edicionId, array $rows): int
    {
        $count = 0;
        foreach ($rows as $r) {
            $profesorId = $this->profesorCandidatoUnico((int) $r->id_escuela, $edicionId);
            if (!$profesorId) {
                $this->line("  ⏭ Sin reparar (varios profesores o ninguno): estudiante {$r->estudiante_id}");
                continue;
            }

            DB::table('profesor_estudiante')->insert([
                'edicion' => $edicionId,
                'id_profesor' => $profesorId,
                'id_estudiante' => $r->estudiante_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->info("  ✓ Vínculo creado: estudiante {$r->estudiante_id} → profesor {$profesorId}");
            $count++;
        }
        return $count;
    }

    private function repararVinculoIncorrecto(int $edicionId, array $rows): int
    {
        $count = 0;
        foreach ($rows as $r) {
            $profesorId = $this->profesorCandidatoUnico((int) $r->escuela_estudiante, $edicionId);
            if (!$profesorId) {
                $this->line("  ⏭ Sin reparar (varios profesores o ninguno): estudiante {$r->estudiante_id}");
                continue;
            }

            DB::table('profesor_estudiante')
                ->where('id', $r->vinculo_id)
                ->update([
                    'id_profesor' => $profesorId,
                    'updated_at' => now(),
                ]);
            $this->info("  ✓ Vínculo corregido: estudiante {$r->estudiante_id} → profesor {$profesorId}");
            $count++;
        }
        return $count;
    }
}
