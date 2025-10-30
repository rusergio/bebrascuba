<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Escuela;
use App\Models\Profesor;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiantes';

    protected $fillable = [
        'nro_ci',
        'nombre',
        'sexo',
        'editado',
        'inscrito'
    ];

    public function escuelas()  
    {  
        return $this->belongsToMany(Escuela::class, 'estudiante_escuela', 'id_estudiante', 'id_escuela')  
                    ->withPivot('edicion', 'grado', 'puntuacion', 'medalla');  
    }  
    
    public function profesores()  
    {  
        return $this->belongsToMany(Profesor::class, 'profesor_estudiante', 'id_estudiante', 'id_profesor')  
                    ->withPivot('edicion');  
    }
}
