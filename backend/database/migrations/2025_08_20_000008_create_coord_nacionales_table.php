<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('coord_nacionales', function (Blueprint $table) {
            $table->id();
            
            // Referencia al usuario (datos personales centralizados)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Referencia a la edición específica
            $table->foreignId('edicion_id')->constrained('ediciones');
            
            // Datos específicos de coordinador nacional
            $table->enum('tipo', ['coordinador', 'asistente'])->default('coordinador');
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            
            $table->timestamps();
            
            // Índices para optimización
            $table->index(['user_id', 'edicion_id']);
            $table->index('fecha_inicio');
            $table->index('fecha_fin');
            
            // Un usuario puede ser coordinador en múltiples ediciones
            // Pero no puede tener dos registros activos simultáneamente en la misma edición
            $table->unique(['user_id', 'edicion_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('coord_nacionales');
    }
};
