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
        // Migración de tabla estudiante  
        Schema::create('estudiantes', function (Blueprint $table) {  
            $table->id();  
            $table->string('nro_ci', 11)->nullable()->unique(); //null si no tiene ci y unico resto
            $table->string('nombre', 80);  
            $table->string('sexo', 10);  
            $table->boolean('editado')->default(false); // Valor predeterminado  
            $table->boolean('inscrito')->default(true); // Valor predeterminado               
            $table->timestamps();  
        });  
    }

    /**
     * Reverse the migrations.
     * @return void
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('estudiantes');
    }
};
