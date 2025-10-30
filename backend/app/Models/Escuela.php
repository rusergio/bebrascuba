<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Profesor;
use App\Models\Estudiante;

class Escuela extends Model
{
    use HasFactory;

    protected $table = 'escuelas';

    protected $fillable = [
        'codigo',
        'nombre',
        'telefono',
        'cdgo_municipio',
        'poblado',
        'subsistema_id',
        'activo',
        'validado'
    ];

    public function subsistema()
    {
        return $this->belongsTo(SubsistemaEscuela::class, 'subsistema_id');
    }

    public function estudiantes()  
    {  
        return $this->belongsToMany(Estudiante::class, 'estudiante_escuela', 'id_escuela', 'id_estudiante')  
                    ->withPivot('edicion', 'grado', 'puntuacion', 'medalla');  
    }
}
