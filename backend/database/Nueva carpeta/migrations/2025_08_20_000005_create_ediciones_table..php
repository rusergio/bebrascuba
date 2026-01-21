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
        // Tabla de migración para ediciones 
        Schema::create('ediciones', function (Blueprint $table) {
            $table->id();
            $table->integer('n_edicion'); // Número de la edicion 
            $table->year('a_edicion'); // El año de la edición 
            $table->date('fecha_convocatoria')->nullable();
		    $table->date('fecha_inic_preinscrip')->nullable();
            $table->date('fecha_fin_preinscrip')->nullable();
		    $table->date('fecha_inic_inscripVille')->nullable();
            $table->date('fecha_inic_realiz')->nullable();
            $table->date('fecha_fin_realiz')->nullable();
		    $table->date('fecha_resultados')->nullable();
            $table->boolean('abierto')->default(false); 
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 
        Schema::dropIfExists('ediciones');
    }
};
