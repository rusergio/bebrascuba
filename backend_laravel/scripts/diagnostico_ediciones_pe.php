<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;

echo "Ediciones:\n";
foreach (DB::table('ediciones')->orderBy('id')->get(['id', 'n_edicion', 'a_edicion', 'abierto']) as $e) {
    $pe = DB::table('profesor_estudiante')->where('edicion', $e->id)->whereNull('deleted_at')->count();
    echo "  id={$e->id} n={$e->n_edicion} año={$e->a_edicion} abierto={$e->abierto} preinscritos={$pe}\n";
}
echo 'Total profesores: ' . DB::table('profesores')->count() . "\n";
