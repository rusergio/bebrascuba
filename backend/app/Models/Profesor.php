<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Profesor extends Model
{
    use HasFactory;

    protected $table = 'profesores';

    protected $fillable = [
        'user_id',
        'esta_activo',
        'es_nuevo',
        'perfil_editado'
    ];

    protected $casts = [
        'esta_activo' => 'boolean',
        'es_nuevo' => 'boolean',
        'perfil_editado' => 'boolean'
    ];

    // Relación con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación con ProfesorEscuela
    public function escuelas()
    {
        return $this->belongsToMany(Escuela::class, 'profesor_escuela', 'id_profesor', 'id_escuela')
                    ->withPivot('edicion')
                    ->withTimestamps();
    }

    // Relación con ProfesorEstudiante
    public function profesorEstudiantes()
    {
        return $this->hasMany(ProfesorEstudiante::class, 'id_profesor');
    }
}
