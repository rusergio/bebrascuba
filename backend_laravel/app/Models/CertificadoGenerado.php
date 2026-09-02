<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CertificadoGenerado extends Model
{
    use HasFactory;

    protected $table = 'certificados_generados';

    protected $fillable = [
        'hash',
        'tipo',
        'edicion',
        'id_plantilla',
        'id_estudiante',
        'id_profesor',
        'id_escuela',
        'categoria',
        'medalla',
        'ruta_archivo',
        'valido',
    ];
}