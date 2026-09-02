<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resultados_pendientes', function (Blueprint $table) {
            $table->foreignId('id_profesor')->nullable()->after('nombre_profesor')->constrained('profesores')->nullOnDelete();
            $table->foreignId('id_estudiante')->nullable()->after('nombre_estudiante')->constrained('estudiantes')->nullOnDelete();
            $table->foreignId('id_escuela')->nullable()->after('escuela_excel')->constrained('escuelas')->nullOnDelete();

            $table->string('estado_validacion', 50)->default('pendiente_no_preinscrito')->after('estado');
            $table->boolean('requiere_aprobacion')->default(false)->after('estado_validacion');
            $table->boolean('editado_por_profesor')->default(false)->after('requiere_aprobacion');
            $table->boolean('aprobado_por_coordinador')->default(false)->after('editado_por_profesor');
            $table->text('descripcion_estado')->nullable()->after('datos_faltantes');
        });

        DB::table('resultados_pendientes')->orderBy('id')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                $estadoValidacion = match ($row->estado) {
                    'revisado', 'actualizado_por_maestro' => 'modificado_profesor',
                    'pendiente' => 'pendiente_no_preinscrito',
                    default => $row->estado ?: 'pendiente_no_preinscrito',
                };

                DB::table('resultados_pendientes')->where('id', $row->id)->update([
                    'estado_validacion' => $estadoValidacion,
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('resultados_pendientes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_profesor');
            $table->dropConstrainedForeignId('id_estudiante');
            $table->dropConstrainedForeignId('id_escuela');
            $table->dropColumn([
                'estado_validacion',
                'requiere_aprobacion',
                'editado_por_profesor',
                'aprobado_por_coordinador',
                'descripcion_estado',
            ]);
        });
    }
};
