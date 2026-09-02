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
        Schema::create('profesor_escuela', function (Blueprint $table) {
            $table->id();
            $table->integer('edicion');
            // Llaves foraneas
            $table->foreign('edicion')->references('id')->on('ediciones')->onDelete('cascade');
            $table->foreignId('id_escuela')->references('id')->on('escuelas')->onDelete('cascade');
            $table->foreignId('id_profesor')->references('id')->on('profesores')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesor_escuela');
    }
};
