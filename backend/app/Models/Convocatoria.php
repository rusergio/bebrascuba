<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Convocatoria extends Model
{
    use HasFactory;

    protected $table = 'convocatoria';

    protected $fillable = [
        'fecha',
        'codigo',
        'cdgo_edic'
    ];
}
