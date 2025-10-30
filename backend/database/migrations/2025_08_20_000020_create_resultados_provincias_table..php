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
        Schema::create('resultados_provincias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_edicion')->references('id')->on('ediciones')->onDelete('cascade');
            $table->foreignId('id_categoria')->references('id')->on('categorias')->onDelete('cascade');
            $table->foreignId('id_provincia')->references('id')->on('provincias')->onDelete('cascade');
            $table->integer('cantidad')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resultados_provincias');
    }
};