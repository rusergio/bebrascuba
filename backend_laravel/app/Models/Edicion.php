<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Edicion extends Model
{
    use HasFactory;
    
    protected $table = 'ediciones';

    protected $fillable = [
        'n_edicion',
        'a_edicion',
        'fecha_convocatoria',
        'fecha_inic_preinscrip',
        'fecha_fin_preinscrip',
        'fecha_inic_inscripVille',
        'fecha_inic_realiz',
        'fecha_fin_realiz',
        'fecha_resultados',
        'abierto',
    ];
}
