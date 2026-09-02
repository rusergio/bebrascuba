<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubsistemaEscuela extends Model
{
    use HasFactory;

    protected $table = 'subsistema_escuelas';

    protected $fillable = [
        'nombre'
    ];

    public function escuelas()
    {
        return $this->hasMany(Escuela::class, 'subsistema_id');
    }
}