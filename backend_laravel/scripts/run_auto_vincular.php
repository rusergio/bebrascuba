<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Edicion;
use App\Models\ResultadoPendiente;
use App\Services\VinculoResultadoPendienteService;

$nEdicion = Edicion::where('abierto', true)->value('n_edicion') ?? 4;
echo "=== AUTO-VINCULAR EDICION {$nEdicion} ===\n\n";

$antes = ResultadoPendiente::where('edicion', $nEdicion)
    ->where(fn ($q) => $q->whereNull('id_estudiante')->orWhereNull('id_escuela'))
    ->count();
echo "Sin vinculo ANTES: {$antes}\n";

$peAntes = \Illuminate\Support\Facades\DB::table('profesor_estudiante')
    ->where('edicion', Edicion::where('n_edicion', $nEdicion)->value('id'))
    ->count();
echo "profesor_estudiante edicion ANTES: {$peAntes}\n\n";

$svc = app(VinculoResultadoPendienteService::class);
$stats = $svc->autoVincularDesdeExcel((int) $nEdicion);

echo "Resultado:\n" . json_encode($stats, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

$despues = ResultadoPendiente::where('edicion', $nEdicion)
    ->where(fn ($q) => $q->whereNull('id_estudiante')->orWhereNull('id_escuela'))
    ->count();
$listos = ResultadoPendiente::where('edicion', $nEdicion)
    ->where('estado_validacion', 'aceptado_coordinador')
    ->whereNotNull('id_estudiante')
    ->whereNotNull('id_escuela')
    ->count();

$peDespues = \Illuminate\Support\Facades\DB::table('profesor_estudiante')
    ->where('edicion', Edicion::where('n_edicion', $nEdicion)->value('id'))
    ->count();

echo "Sin vinculo DESPUES: {$despues}\n";
echo "Aceptados listos integrar: {$listos}\n";
echo "profesor_estudiante edicion DESPUES: {$peDespues}\n";
