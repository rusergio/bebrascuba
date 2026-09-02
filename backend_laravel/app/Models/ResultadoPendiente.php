<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultadoPendiente extends Model
{
    use HasFactory;

    protected $table = 'resultados_pendientes';

    protected $fillable = [
        'edicion',
        'id_categoria',
        'correo_profesor',
        'nombre_profesor',
        'id_profesor',
        'student_username',
        'nombre_estudiante',
        'id_estudiante',
        'sexo',
        'escuela_excel',
        'id_escuela',
        'grado',
        'puntuacion',
        'medalla',
        'datos_faltantes',
        'descripcion_estado',
        'observaciones',
        'estado',
        'estado_validacion',
        'requiere_aprobacion',
        'editado_por_profesor',
        'aprobado_por_coordinador',
    ];

    protected $casts = [
        'requiere_aprobacion' => 'boolean',
        'editado_por_profesor' => 'boolean',
        'aprobado_por_coordinador' => 'boolean',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
    }

    public function profesor()
    {
        return $this->belongsTo(Profesor::class, 'id_profesor');
    }

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'id_estudiante');
    }

    public function escuela()
    {
        return $this->belongsTo(Escuela::class, 'id_escuela');
    }
}
