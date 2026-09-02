<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categorias';

    protected $fillable = [
        'nombre_cuba',
        'nombre_bebras',
        'grado_inferior',
        'grado_superior',
        'edad_inferior',
        'edad_superior',
    ];
}
