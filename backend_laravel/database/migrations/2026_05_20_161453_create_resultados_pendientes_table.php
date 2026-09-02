<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resultados_pendientes', function (Blueprint $table) {
            $table->id();

            $table->integer('edicion')->nullable();

            $table->foreignId('id_categoria')
                ->nullable()
                ->constrained('categorias')
                ->nullOnDelete();

            $table->string('correo_profesor')->nullable();
            $table->string('nombre_profesor')->nullable();

            $table->string('student_username')->nullable();
            $table->string('nombre_estudiante');
            $table->string('sexo', 20)->nullable();

            $table->string('escuela_excel')->nullable();
            $table->integer('grado')->nullable();

            $table->integer('puntuacion')->nullable();
            $table->string('medalla', 30)->nullable();

            $table->text('datos_faltantes')->nullable();
            $table->text('observaciones')->nullable();

            $table->string('estado', 50)->default('pendiente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultados_pendientes');
    }
};