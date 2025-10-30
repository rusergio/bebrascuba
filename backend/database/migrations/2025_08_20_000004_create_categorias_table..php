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
        Schema::create('categorias', function (Blueprint $table) {  
            $table->id();  
            $table->string('nombre_cuba', 30)->nullable();  
            $table->string('nombre_bebras', 30)->nullable(); 
            $table->integer('grado_inferior');  
            $table->integer('grado_superior');  
            $table->integer('edad_inferior');  
            $table->integer('edad_superior'); 
            $table->timestamps();  
        });  
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('categorias');
    }
};
