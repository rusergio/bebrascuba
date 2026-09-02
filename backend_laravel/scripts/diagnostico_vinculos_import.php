<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Edicion;
use App\Models\ResultadoPendiente;
use Illuminate\Support\Facades\DB;

$nEdicion = Edicion::where('abierto', true)->value('n_edicion')
    ?? Edicion::orderByDesc('id')->value('n_edicion');

$idEdicion = Edicion::where('n_edicion', $nEdicion)->value('id');

echo "Edicion: n={$nEdicion}, id={$idEdicion}\n\n";

$total = ResultadoPendiente::where('edicion', $nEdicion)->count();
$sinProf = ResultadoPendiente::where('edicion', $nEdicion)->whereNull('id_profesor')->count();
$sinEst = ResultadoPendiente::where('edicion', $nEdicion)->whereNull('id_estudiante')->count();

echo "Total pendientes: {$total}\n";
echo "Sin id_profesor: {$sinProf}\n";
echo "Sin id_estudiante: {$sinEst}\n\n";

// Emails únicos en Excel importado
$emailsExcel = ResultadoPendiente::where('edicion', $nEdicion)
    ->whereNotNull('correo_profesor')
    ->distinct()
    ->pluck('correo_profesor')
    ->map(fn ($e) => strtolower(trim($e)));

echo "Teacher Emails únicos en Excel: " . $emailsExcel->count() . "\n";

$enUsers = DB::table('users')
    ->whereIn(DB::raw('LOWER(correo)'), $emailsExcel->unique()->values())
    ->pluck('correo')
    ->map(fn ($e) => strtolower(trim($e)));

$emailsEnSistema = $enUsers->unique();
$emailsFaltantes = $emailsExcel->unique()->diff($emailsEnSistema);

echo "Emails encontrados en users: " . $emailsEnSistema->count() . "\n";
echo "Emails NO en users: " . $emailsFaltantes->count() . "\n\n";

// De los que SÍ existen en users, cuántos tienen perfil profesor
$conProfesor = DB::table('users as u')
    ->join('profesores as p', 'p.user_id', '=', 'u.id')
    ->whereIn(DB::raw('LOWER(u.correo)'), $emailsEnSistema->values())
    ->count();

echo "De los en users, con perfil profesor: {$conProfesor}\n";

// Registros cuyo email SÍ está en users
$registrosEmailOk = ResultadoPendiente::where('edicion', $nEdicion)
    ->whereIn(DB::raw('LOWER(correo_profesor)'), $emailsEnSistema->values())
    ->count();

echo "Registros con Teacher Email en sistema: {$registrosEmailOk}\n";

// profesor_estudiante count for edition
$peCount = DB::table('profesor_estudiante')->where('edicion', $idEdicion)->whereNull('deleted_at')->count();
echo "Vínculos profesor_estudiante en edición: {$peCount}\n\n";

if ($emailsFaltantes->count() > 0) {
    echo "Primeros 10 emails del Excel NO registrados:\n";
    foreach ($emailsFaltantes->take(10) as $e) {
        $cnt = ResultadoPendiente::where('edicion', $nEdicion)->whereRaw('LOWER(correo_profesor)=?', [$e])->count();
        echo "  {$e} ({$cnt} estudiantes)\n";
    }
}

// Si hay emails en sistema pero sin vinculo estudiante
if ($registrosEmailOk > 0) {
    echo "\n--- Diagnóstico emails SÍ en sistema ---\n";
    $muestra = ResultadoPendiente::where('edicion', $nEdicion)
        ->whereIn(DB::raw('LOWER(correo_profesor)'), $emailsEnSistema->values())
        ->whereNull('id_estudiante')
        ->limit(5)
        ->get(['correo_profesor', 'nombre_estudiante', 'datos_faltantes']);
    foreach ($muestra as $m) {
        echo "  {$m->correo_profesor} | {$m->nombre_estudiante} | {$m->datos_faltantes}\n";
    }
}
