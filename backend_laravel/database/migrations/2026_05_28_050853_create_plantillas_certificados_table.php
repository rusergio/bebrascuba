<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plantillas_certificados', function (Blueprint $table) {
            $table->id();

            $table->string('nombre');

            // estudiante, maestro, colaborador, escuela
            $table->string('tipo', 50);

            // SuperPeque, Peque, Benjamin, Cadete, Junior, Senior
            $table->string('categoria', 50)->nullable();

            // Oro, Plata, Bronce, Participa
            $table->string('medalla', 50)->nullable();

            $table->string('ruta_archivo');

            $table->boolean('activa')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plantillas_certificados');
    }
};