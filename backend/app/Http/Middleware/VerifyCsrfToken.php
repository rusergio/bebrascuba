<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        //
        'api/auth/login',
        'api/auth/register',
        'api/registrar-profesor',
        'api/auth/logout',
        'api/user/login',
        'api/aceptar-solicitud/*',
        'api/ediciones/cerrar',
        'api/ediciones/abrir',
        'api/recursos',
        'api/registrar-usuario',
        'api/estudiantes/inscribir',
        'api/actualizar-fecha',
        'api/actualizar-fecha-import',
        'api/cambiar-pin/*', 
        'api/cambiar-contrasenia/*', 
        'api/cambiar-correo/*', 
        'api/cambiar-telefono/*', 
        'api/comprobar-pin', 
        'api/enviar-link-registro', 
        'api/eliminar-recurso/*', 
        'api/recursos/*'
    ];
}
