<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabla de municipios
        Schema::create('municipios', function (Blueprint $table) {
            $table->id();  // Campo autoincremental
            $table->integer('codigo')->unique();  // Campo único
            $table->string('nombre', 30); // Nombre de municipio con tamñano de 30 caracteres
            $table->integer('cdgo_provincia'); 
            // Llave foranea
            $table->foreign('cdgo_provincia')->references('codigo')->on('provincias')->onDelete('cascade');  // Llave foránea a la tabla de provincias
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar la tabla provincias si ya existe 
        Schema::dropIfExists('municipios'); 
    }
};
