<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Edicion;
use App\Models\ResultadoPendiente;
use App\Services\VinculoResultadoPendienteService;

$nEdicion = Edicion::where('abierto', true)->value('n_edicion')
    ?? Edicion::orderByDesc('id')->value('n_edicion');

echo "Edicion n_edicion: {$nEdicion}\n";

$countSin = fn () => ResultadoPendiente::where('edicion', $nEdicion)
    ->where(fn ($q) => $q->whereNull('id_estudiante')->orWhereNull('id_escuela')->orWhereNull('id_profesor'))
    ->count();

$countAceptSin = fn () => ResultadoPendiente::where('edicion', $nEdicion)
    ->where('estado_validacion', 'aceptado_coordinador')
    ->where(fn ($q) => $q->whereNull('id_estudiante')->orWhereNull('id_escuela'))
    ->count();

echo "Sin vinculo (total) ANTES: " . $countSin() . "\n";
echo "Aceptados sin vinculo ANTES: " . $countAceptSin() . "\n";

$svc = app(VinculoResultadoPendienteService::class);
$stats = $svc->repararEdicion((int) $nEdicion);

echo "Reparacion: " . json_encode($stats, JSON_PRETTY_PRINT) . "\n";

echo "Sin vinculo (total) DESPUES: " . $countSin() . "\n";
echo "Aceptados sin vinculo DESPUES: " . $countAceptSin() . "\n";

$listos = ResultadoPendiente::where('edicion', $nEdicion)
    ->where('estado_validacion', 'aceptado_coordinador')
    ->whereNotNull('id_estudiante')
    ->whereNotNull('id_escuela')
    ->count();

echo "Aceptados listos para integrar: {$listos}\n";

// Muestra de 5 que siguen sin vinculo
$muestras = ResultadoPendiente::where('edicion', $nEdicion)
    ->where('estado_validacion', 'aceptado_coordinador')
    ->where(fn ($q) => $q->whereNull('id_estudiante')->orWhereNull('id_escuela'))
    ->limit(5)
    ->get(['id', 'correo_profesor', 'nombre_estudiante', 'student_username', 'datos_faltantes']);

if ($muestras->isNotEmpty()) {
    echo "\nMuestras sin vinculo (max 5):\n";
    foreach ($muestras as $m) {
        echo "  #{$m->id} | {$m->correo_profesor} | {$m->nombre_estudiante} | {$m->datos_faltantes}\n";
    }
}
