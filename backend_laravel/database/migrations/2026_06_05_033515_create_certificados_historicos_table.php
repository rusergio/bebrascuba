<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificados_historicos', function (Blueprint $table) {
            $table->id();
            $table->integer('edicion')->nullable();
            $table->string('tipo')->default('estudiante');
            $table->string('nombre')->nullable();
            $table->string('categoria')->nullable();
            $table->string('medalla')->nullable();
            $table->string('hash')->unique();
            $table->string('url_original')->nullable();
            $table->string('ruta_archivo')->nullable();
            $table->boolean('valido')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificados_historicos');
    }
};