<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Edicion;
use App\Models\ResultadoPendiente;
use Illuminate\Support\Facades\DB;

$nEdicion = Edicion::where('abierto', true)->value('n_edicion') ?? 4;

$filas = ResultadoPendiente::where('edicion', $nEdicion)
    ->whereNotNull('correo_profesor')
    ->select('correo_profesor', DB::raw('COUNT(*) as total'))
    ->groupBy('correo_profesor')
    ->orderByDesc('total')
    ->get();

$emailsSistema = DB::table('users')
    ->whereNotNull('correo')
    ->pluck('correo')
    ->map(fn ($e) => strtolower(trim($e)))
    ->flip();

$sinRegistro = [];
$sinPerfilProfesor = [];

foreach ($filas as $fila) {
    $email = strtolower(trim($fila->correo_profesor));
    if (!isset($emailsSistema[$email])) {
        $sinRegistro[] = [
            'email' => $fila->correo_profesor,
            'estudiantes' => (int) $fila->total,
        ];
        continue;
    }

    $userId = DB::table('users')->whereRaw('LOWER(correo) = ?', [$email])->value('id');
    $tieneProfesor = DB::table('profesores')->where('user_id', $userId)->exists();
    if (!$tieneProfesor) {
        $sinPerfilProfesor[] = [
            'email' => $fila->correo_profesor,
            'estudiantes' => (int) $fila->total,
        ];
    }
}

usort($sinRegistro, fn ($a, $b) => $b['estudiantes'] <=> $a['estudiantes']);

echo "Edición n_edicion: {$nEdicion}\n";
echo "Teacher Emails NO registrados en users: " . count($sinRegistro) . "\n\n";

$totalEst = 0;
foreach ($sinRegistro as $i => $row) {
    $n = $i + 1;
    echo "{$n}. {$row['email']} — {$row['estudiantes']} estudiante(s)\n";
    $totalEst += $row['estudiantes'];
}

echo "\nTotal estudiantes afectados (sin profesor en sistema): {$totalEst}\n";

if (count($sinPerfilProfesor) > 0) {
    echo "\n--- Usuario existe pero SIN perfil profesor ---\n";
    foreach ($sinPerfilProfesor as $row) {
        echo "  {$row['email']} — {$row['estudiantes']} estudiante(s)\n";
    }
}

// Muestra nombres de estudiantes del primer email como ejemplo
if (count($sinRegistro) > 0) {
    $ejemplo = $sinRegistro[0]['email'];
    echo "\nEjemplo estudiantes de {$ejemplo}:\n";
    $muestras = ResultadoPendiente::where('edicion', $nEdicion)
        ->whereRaw('LOWER(correo_profesor) = ?', [strtolower(trim($ejemplo))])
        ->limit(5)
        ->pluck('nombre_estudiante');
    foreach ($muestras as $nombre) {
        echo "  · {$nombre}\n";
    }
}
