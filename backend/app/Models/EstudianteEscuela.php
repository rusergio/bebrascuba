<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstudianteEscuela extends Model
{
    use HasFactory;

    protected $table = 'estudiante_escuela';

    protected $fillable = [
        'edicion',
        'id_estudiante',
        'id_escuela',
        'grado',
        'puntuacion',
        'medalla',
    ];
}
