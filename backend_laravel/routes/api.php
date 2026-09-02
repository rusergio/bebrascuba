<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CoordinadorController;
use App\Http\Controllers\CoordinadorResultadosController;
use App\Http\Controllers\EdicionController;
use App\Http\Controllers\EscuelaController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\ImportarResultadosController;
use App\Http\Controllers\MedallasEdicionController;
use App\Http\Controllers\MunicipioController;
use App\Http\Controllers\ProfesorController;
use App\Http\Controllers\ProfesorResultadosController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\RecursoController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SubsistemaController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Rutas públicas (sin autenticación)
|--------------------------------------------------------------------------
*/

Route::post('user/login', [UserController::class, 'login'])->middleware('throttle:10,1');
Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/comprobar-pin', [UserController::class, 'verificarPin'])->middleware('throttle:5,1');
Route::put('/cambiar-contrasenia/{userId}', [UserController::class, 'cambiarContrasenia'])->middleware('throttle:5,1');

Route::get('/provincias', [ProvinciaController::class, 'index'])->name('provincias.index');
Route::get('/municipios/{cdgo_provincia}', [MunicipioController::class, 'index'])->name('municipios.index');
Route::get('/categorias', [CategoriaController::class, 'listarCategorias']);
Route::get('/escuelas/provincia/{cdgo_provincia}/detalle', [EscuelaController::class, 'listarDetallePorProvincia']);
Route::get('/escuelas/{cdgo_municipio}', [EscuelaController::class, 'index'])->name('escuelas.index');
Route::get('/escuelas/{cdgo_municipio}/detalle', [EscuelaController::class, 'listarDetalle']);
Route::post('/registrar-escuela', [EscuelaController::class, 'registrarEscuela'])->middleware('throttle:10,1');

Route::post('/registrar-profesor', [ProfesorController::class, 'registrarProfesor'])->middleware('throttle:5,1');
Route::post('/registrar_profesor', [UserController::class, 'RegistSolicProf'])->middleware('throttle:5,1');
Route::get('/comprobar-ci/{nro_ci}', [ProfesorController::class, 'verificarCI'])->middleware('throttle:10,1');

Route::get('/edicion/esta-abierta', [EdicionController::class, 'isEditionOpen']);
Route::get('/is-open', [EdicionController::class, 'isEditionOpen']);
Route::get('/ediciones-con-resultados', [EdicionController::class, 'listarEdicionesConResultados']);
Route::get('/resultados', [EdicionController::class, 'listarResultadosProvincias']);
Route::get('/total-provincias', [EdicionController::class, 'totalCantidadPorProvincia']);
Route::get('/total-categorias', [EdicionController::class, 'totalCantidadPorCategoria']);
Route::get('/total-totalprovincia', [EdicionController::class, 'totalTotalPorProvincia']);
Route::get('/listar-edicion-actual', [EdicionController::class, 'listarEdicionActual']);
Route::get('/nro_edicion', [EdicionController::class, 'nroEdicion']);
Route::get('/ultima-edicion-cerrada', [EdicionController::class, 'ultimaEdicionCerrada']);
Route::get('/listar-subsistemas', [SubsistemaController::class, 'listarSubsistemas']);

Route::get('/listar-recursos', [RecursoController::class, 'listarRecursos']);
Route::get('/ver-recurso/{archivo}', [RecursoController::class, 'verRecurso']);
Route::get('/descargar-recurso/{archivo}', [RecursoController::class, 'descargarRecurso']);

// Fotos de perfil: solo archivos registrados en la BD (sin listado arbitrario)
Route::get('/storage/users/fotos/{filename}', [UserController::class, 'serveUserPhoto']);

/*
|--------------------------------------------------------------------------
| Rutas autenticadas (requieren token Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('user/logout', [UserController::class, 'logout']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('user/me', [UserController::class, 'me']);

    // Perfil propio (ownership validado en controlador)
    Route::put('/cambiar-pin/{userId}', [UserController::class, 'cambiarPin']);
    Route::put('/cambiar-correo/{userId}', [UserController::class, 'cambiarCorreo']);
    Route::put('/cambiar-telefono/{userId}', [UserController::class, 'cambiarNroTelefono']);
    Route::post('/usuarios/{userId}/foto-perfil', [UserController::class, 'uploadUserPhoto']);
    Route::get('/usuarios/{userId}/foto-perfil', [UserController::class, 'getUserPhoto']);

    // Profesor: gestión de estudiantes y perfil (ownership validado en controlador)
    Route::get('/listar-estudiantes/{id_profesor}', [ProfesorController::class, 'listarEstudiantes']);
    Route::post('/estudiantes/inscribir', [EstudianteController::class, 'inscribir'])->name('estudiantes.inscribir');
    Route::post('/estudiantes/subir-grado', [EstudianteController::class, 'subirGrado']);
    Route::post('/estudiantes/reinscribir', [EstudianteController::class, 'reinscribir']);
    Route::post('/estudiantes/preinscribir', [EstudianteController::class, 'preinscribir']);
    Route::put('/profesores/{id}', [ProfesorController::class, 'actualizar'])->name('profesores.actualizar');
    Route::post('/enviar-link-registro', [ProfesorController::class, 'enviarLinkRegistro']);

    Route::get('/profesores', [ProfesorController::class, 'index'])->name('profesores.index');
    Route::get('/listar-roles', [RoleController::class, 'listarRoles']);

    // Recursos (escritura)
    Route::post('/recursos', [RecursoController::class, 'guardarArchivo']);
    Route::put('/recursos/{id}', [RecursoController::class, 'actualizarRecurso']);
    Route::delete('/eliminar-recurso/{id_recurso}', [RecursoController::class, 'eliminarRecurso']);

    $rolesAdmin = 'role:Administrador,Coordinador Nacional,Coordinador Asistente';
    $rolesCoordinador = 'role:Administrador,Coordinador Nacional,Coordinador Asistente,Coordinador Provincial MINED,Coordinador Municipal MINED';
    $rolesGestionUsuarios = 'role:Administrador,Coordinador Nacional,Coordinador Asistente,Coordinador Provincial MINED,Coordinador Municipal MINED';
    $rolesProfesor = 'role:Profesor';

    /*
    |--------------------------------------------------------------------------
    | Administración nacional (Coordinador Nacional / Asistente / Admin)
    |--------------------------------------------------------------------------
    */
    Route::middleware($rolesAdmin)->group(function () {
        Route::post('/ediciones/abrir', [EdicionController::class, 'abrirEdicion'])->name('ediciones.abrir');
        Route::post('/ediciones/cerrar', [EdicionController::class, 'cerrarEdicion'])->name('ediciones.cerrar');
        Route::get('/ediciones/{n_edicion}/vista-previa-publicacion', [EdicionController::class, 'vistaPreviaPublicacion']);
        Route::post('/ediciones/{n_edicion}/publicar-resultados-web', [EdicionController::class, 'publicarResultadosWeb']);
        Route::put('/actualizar-fecha', [EdicionController::class, 'marcarFechasEdicion']);
        Route::put('/actualizar-fecha-import', [EdicionController::class, 'marcarFechasImportantes']);
        Route::post('/usuarios/{id}/roles', [UserController::class, 'asignarRol']);
        Route::post('/registrar-usuario', [ProfesorController::class, 'registrarUsuario']);
        Route::post('/registrar-usuario-rol', [UserController::class, 'registrarUsuarioRol']);

        // Importación de resultados desde Excel de Ville
        Route::post('/importar-resultados', [ImportarResultadosController::class, 'importar']);
        Route::post('/resultados/importar-excel', [ImportarResultadosController::class, 'importar']);

        // Medallas por edición
        Route::get('/medallas/edicion/{edicion}/calcular', [MedallasEdicionController::class, 'calcularYActualizar']);
        Route::get('/medallas/edicion/{edicion}/calcular-pendientes', [MedallasEdicionController::class, 'calcularPendientes']);
        Route::get('/medallas/edicion/{edicion}/resumen', [MedallasEdicionController::class, 'resumen']);
        Route::get('/medallas/edicion/{edicion}/listado', [MedallasEdicionController::class, 'listado']);

        // Coordinador: revisión e integración de resultados importados
        Route::prefix('coordinador/resultados')->group(function () {
            Route::get('/edicion/{edicion}/revision/resumen', [CoordinadorResultadosController::class, 'revisionResumen']);
            Route::get('/edicion/{edicion}/todos', [CoordinadorResultadosController::class, 'todos']);
            Route::get('/edicion/{edicion}/preinscritos', [CoordinadorResultadosController::class, 'preinscritos']);
            Route::get('/edicion/{edicion}/pendientes', [CoordinadorResultadosController::class, 'pendientes']);
            Route::get('/edicion/{edicion}/inconsistencias', [CoordinadorResultadosController::class, 'inconsistencias']);
            Route::get('/edicion/{edicion}/modificados-profesor', [CoordinadorResultadosController::class, 'modificadosProfesor']);
            Route::get('/edicion/{edicion}/aceptados', [CoordinadorResultadosController::class, 'aceptados']);
            Route::get('/edicion/{edicion}/insertados-historico', [CoordinadorResultadosController::class, 'insertadosHistorico']);
            Route::get('/edicion/{edicion}/pendientes-integracion', [CoordinadorResultadosController::class, 'pendientesIntegracion']);
            Route::get('/edicion/{edicion}/oficiales', [CoordinadorResultadosController::class, 'oficiales']);
            Route::get('/edicion/{edicion}/oficiales/resumen', [CoordinadorResultadosController::class, 'oficialesResumen']);

            Route::get('/{id}/detalle', [CoordinadorResultadosController::class, 'detalle']);
            Route::put('/{id}/aceptar', [CoordinadorResultadosController::class, 'aceptar']);
            Route::put('/edicion/{edicion}/aceptar-preinscritos', [CoordinadorResultadosController::class, 'aceptarPreinscritos']);
            Route::put('/aceptar-masivo', [CoordinadorResultadosController::class, 'aceptarMasivo']);
            Route::put('/{id}/ajustar-medalla', [CoordinadorResultadosController::class, 'ajustarMedalla']);
            Route::put('/edicion/{edicion}/reparar-vinculos', [CoordinadorResultadosController::class, 'repararVinculos']);
            Route::put('/edicion/{edicion}/auto-vincular-excel', [CoordinadorResultadosController::class, 'autoVincularDesdeExcel']);
            Route::put('/edicion/{edicion}/insertar-historico', [CoordinadorResultadosController::class, 'insertarHistorico']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Coordinación regional (provincia / municipio)
    |--------------------------------------------------------------------------
    */
    Route::middleware($rolesCoordinador)->group(function () {
        Route::put('/aceptar-solicitud/{profesorId}', [CoordinadorController::class, 'aceptarSolicitud']);
        Route::get('/profesores-inactivos', [CoordinadorController::class, 'listarProfesoresInactivos']);
        Route::get('/solicitudes', [CoordinadorController::class, 'listarSolicitud']);
        Route::get('/listar-profesores', [CoordinadorController::class, 'listarProfesores']);
        Route::get('/mi-territorio', [CoordinadorController::class, 'miTerritorio']);
        Route::put('/escuelas/{id}/validar', [EscuelaController::class, 'validarEscuela']);

        /**
         * @author: DGLio+DeepSeek
         * @arg: Rutas para obtener profesores por provincia o municipio
         * date: 2025-10-25
         */
        Route::get('/profesores/provincia/{id}', [ProfesorController::class, 'listarProfesoresPorProvincia']);
        Route::get('/profesores/municipio/{codigo}', [ProfesorController::class, 'listarProfesoresPorMunicipio']);
        Route::get('/profesores/{tipo}/{valor}', [ProfesorController::class, 'listarProfesoresRegional']);
    });

    /*
    |--------------------------------------------------------------------------
    | Gestión de usuarios (coordinadores y administrador)
    |--------------------------------------------------------------------------
    */
    Route::middleware($rolesGestionUsuarios)->group(function () {
        Route::get('/usuarios/no-profesores', [UserController::class, 'listarUsuariosNoProfesores']);
        Route::get('/usuarios/profesores', [UserController::class, 'listarProfesores']);
        Route::get('/usuarios/multiples-roles', [UserController::class, 'listarUsuariosConMultiplesRoles']);
        Route::get('/usuarios/todos', [UserController::class, 'listarTodosUsuarios']);
    });

    /*
    |--------------------------------------------------------------------------
    | Profesor: resultados pendientes y oficiales
    |--------------------------------------------------------------------------
    */
    Route::middleware($rolesProfesor)->prefix('profesor/resultados')->group(function () {
        Route::get('/edicion/{edicion}/profesor/{idProfesor}/pendientes', [ProfesorResultadosController::class, 'pendientes']);
        Route::get('/profesor/{idProfesor}/{id}/detalle-pendiente', [ProfesorResultadosController::class, 'detallePendiente']);
        Route::put('/{id}/modificar-pendiente', [ProfesorResultadosController::class, 'modificarPendiente']);
        Route::get('/edicion/{edicion}/profesor/{idProfesor}/oficiales', [ProfesorResultadosController::class, 'oficiales']);
        Route::get('/edicion/{edicion}/profesor/{idProfesor}/oficiales/resumen', [ProfesorResultadosController::class, 'oficialesResumen']);
        Route::get('/profesor/{idProfesor}/oficial/{id}/detalle', [ProfesorResultadosController::class, 'detalleOficial']);
    });
});
