<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecutar migración 
     */
    public function up(): void
    {
        // Tabla users centralizada con datos personales y autenticación
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            // Datos personales centralizados
            $table->string('nombre', 30);
            $table->string('apellidos', 50);
            $table->string('nro_ci', 11)->unique();
            $table->string('telefono', 20);
            $table->string('foto_perfil')->nullable();

            // Datos de autenticación
            $table->string('correo', 100)->unique();
            $table->string('contrasenia', 150);
            $table->string('pin', 150);
            $table->rememberToken();

            $table->timestamps();
            $table->softDeletes();
        });
        
        // Tabla para reset de contraseñas
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('correo')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabla de sesiones
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
