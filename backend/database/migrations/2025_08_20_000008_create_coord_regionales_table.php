<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Coordinadores regionales (provinciales y municipales)
        Schema::create('coord_regionales', function (Blueprint $table) {
            $table->id();
            
            // Referencias básicas
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('edicion_id')->constrained('ediciones');
            $table->foreignId('provincia_id')->constrained('provincias');
            $table->foreignId('municipio_id')->nullable()->constrained('municipios');
            
            // Datos específicos
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            
            $table->timestamps();
            
            // Índices para optimización
            $table->index(['user_id', 'edicion_id']);
            $table->index(['provincia_id', 'municipio_id']);
            $table->index('fecha_inicio');
            $table->index('fecha_fin');
            
            // Un usuario puede ser coordinador en múltiples ediciones/provincias/municipios
            // Pero no puede tener dos registros activos simultáneamente en la misma combinación
            $table->unique(['user_id', 'edicion_id', 'provincia_id', 'municipio_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('coord_regionales');
    }
};
