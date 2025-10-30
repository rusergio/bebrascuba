<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('escuelas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->nullable();
            $table->string('nombre', 50);
            $table->string('telefono', 15)->nullable();
            $table->integer('cdgo_municipio');
            $table->string('poblado', 50)->nullable();
            // Campo subsistema corregido
            $table->integer('subsistema_id');
            // campo activo adicionado, se situa en true despues de validada o creada por coordinadores y 
            // en falso si se desactiva por algun problema  o se elimina con softdelete()
            $table->boolean('activo')->default(false);
            $table->boolean('validado')->default(false);
            
            // Claves foráneas corregidas
            $table->foreign('cdgo_municipio')
                  ->references('codigo')
                  ->on('municipios')
                  ->onDelete('cascade');
                  
            $table->foreign('subsistema_id')
                  ->references('id')
                  ->on('subsistema_escuelas') 
                  ->onDelete('cascade');
            
            $table->softdeletes();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('escuelas');
    }
};
