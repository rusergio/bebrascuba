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
        Schema::create('edicion_categoria', function (Blueprint $table) {  
            $table->id(); 
            $table->integer('edicion'); 
            // Llaves foraneas
            $table->foreign('edicion')->references('id')->on('ediciones')->onDelete('cascade');
            $table->foreignId('id_categoria')->references('id')->on('categorias')->onDelete('cascade'); // Relación con el estudiante
            $table->timestamps();  
        });  
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('edicion_categoria');
    }
};
