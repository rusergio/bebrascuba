<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Registrado ≠ inscrito en concurso: por defecto false hasta preinscribir.
        DB::table('estudiantes')->update(['inscrito' => false]);

        Schema::table('estudiantes', function (Blueprint $table) {
            $table->boolean('inscrito')->default(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('estudiantes', function (Blueprint $table) {
            $table->boolean('inscrito')->default(true)->change();
        });
    }
};
