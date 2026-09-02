<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfesorEstudiante extends Model
{
    use HasFactory;

    protected $table = 'profesor_estudiante';

    protected $fillable = [
        'edicion',
        'id_profesor',
        'id_estudiante',
    ];
}
