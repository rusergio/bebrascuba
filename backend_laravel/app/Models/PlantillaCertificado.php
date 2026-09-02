<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantillaCertificado extends Model
{
    use HasFactory;

    protected $table = 'plantillas_certificados';

    protected $fillable = [
        'nombre',
        'tipo',
        'categoria',
        'medalla',
        'ruta_archivo',
        'activa',
    ];
}