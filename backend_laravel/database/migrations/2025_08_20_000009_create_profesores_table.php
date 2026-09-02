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
        Schema::create('profesores', function (Blueprint $table) {
            $table->id();
            // Referencia al usuario (datos personales centralizados)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Datos específicos de profesor (no duplicados en users)
            $table->boolean('es_nuevo')->default(true);
            $table->boolean('perfil_editado')->default(false);
            $table->boolean('esta_activo')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
            // A los profesores se le asocia una escuela por edicion  y 
            // estudiantes por cada edicion
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesores');
    }
};
