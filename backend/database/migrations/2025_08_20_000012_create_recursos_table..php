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
        //Modificacion para que los recursos sin numero de edicion
        //se coloquen en una edicion con valor null.
        // ESTO no debe afectar lo que tienes
        Schema::create('recursos', function (Blueprint $table) {
            $table->id();
            $table->integer('edicion')->nullable(); // Permite recursos generales sin edición específica
            $table->string('nombre', 100); // Nombre del recurso
            $table->string('descripcion', 255)->nullable(); // Descripción opcional del recurso
            $table->text('archivo_path'); // Ruta al archivo PDF
            // Llave foranea
            $table->foreign('edicion')->references('id')->on('ediciones')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('recursos');
    }
};
