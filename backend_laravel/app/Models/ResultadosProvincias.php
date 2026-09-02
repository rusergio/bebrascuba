<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResultadosProvincias extends Model
{
    use HasFactory;

    protected $table = 'resultados_provincias';

    protected $fillable = [
        'id_edicion',
        'id_categoria',
        'id_provincia',
        'cantidad',
    ];

    public function provincia()  
    {  
        return $this->belongsTo(Provincia::class, 'id_provincia', 'id');  
    }  

    public function categoria()  
    {  
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id');  
    }  
}
