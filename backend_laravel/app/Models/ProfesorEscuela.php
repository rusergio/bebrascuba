<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfesorEscuela extends Model
{
    use HasFactory;

    protected $table = 'profesor_escuela';
    // Define los campos que puedes llenar con asignación masiva
    protected $fillable = [
        'edicion',
        'id_escuela',
        'id_profesor',
    ];
}
