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
        //
        Schema::create('estudiante_escuela', function (Blueprint $table) {
            $table->id();
            $table->integer('edicion');
            $table->integer('grado')->nullable();
            $table->integer('puntuacion')->nullable(); // Puntuación obtenido en el concurso 
            $table->string('medalla', 15)->nullable(); // Tipo de medalla o reconocimiento
            // Llaves foraneas
            $table->foreign('edicion')->references('id')->on('ediciones')->onDelete('cascade');
            $table->foreignId('id_categoria')->references('id')->on('categorias')->onDelete('cascade');
            $table->foreignId('id_estudiante')->references('id')->on('estudiantes')->onDelete('cascade');
            $table->foreignId('id_escuela')->references('id')->on('escuelas')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('estudiante_escuela');
    }
};
