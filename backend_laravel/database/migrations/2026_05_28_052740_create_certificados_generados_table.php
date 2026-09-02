<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificados_generados', function (Blueprint $table) {
            $table->id();

            $table->string('hash')->unique();

            // estudiante, maestro, colaborador, escuela
            $table->string('tipo', 50);

            $table->integer('edicion')->nullable();

            $table->foreignId('id_plantilla')
                ->nullable()
                ->constrained('plantillas_certificados')
                ->nullOnDelete();

            $table->foreignId('id_estudiante')
                ->nullable()
                ->constrained('estudiantes')
                ->nullOnDelete();

            $table->foreignId('id_profesor')
                ->nullable()
                ->constrained('profesores')
                ->nullOnDelete();

            $table->foreignId('id_escuela')
                ->nullable()
                ->constrained('escuelas')
                ->nullOnDelete();

            $table->string('categoria', 50)->nullable();
            $table->string('medalla', 50)->nullable();

            $table->string('ruta_archivo')->nullable();

            $table->boolean('valido')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificados_generados');
    }
};