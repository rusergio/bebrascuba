<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CalculoMedallasController;
use App\Http\Controllers\PlantillaCertificadoController;
use App\Http\Controllers\GenerarCertificadoController;
use App\Http\Controllers\VerificarCertificadoController;
use App\Http\Controllers\MedallasEdicionController;
use App\Http\Controllers\MedallasExcelController;
use App\Http\Controllers\ResultadosPendientesController;
use App\Http\Controllers\CertificadosColaboradoresController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__ . '/auth.php';

Route::middleware(['web'])->group(function () {
    Route::get('/sanctum/csrf-cookie', function () {
        return response()->noContent();
    });
});

/////////////////////////////////

use App\Http\Controllers\ImportarResultadosController;

Route::get('/importar-resultados', function () {
    return view('importar-resultados');
});

Route::post('/importar-resultados', [ImportarResultadosController::class, 'importar']);

Route::get('/plantillas-certificados', [PlantillaCertificadoController::class, 'index']);
Route::put('/plantillas-certificados/{id}/desactivar', [PlantillaCertificadoController::class, 'desactivar']);

Route::get('/generar-certificado-prueba', [GenerarCertificadoController::class, 'generarPrueba']);
Route::get('/generar-certificado-estudiante/{id}', [GenerarCertificadoController::class, 'generarEstudiante']);
Route::get('/generar-certificados-estudiantes/edicion/{edicion}', [GenerarCertificadoController::class, 'generarTodosEstudiantes']);

Route::get('/profesor/{idProfesor}/edicion/{edicion}/certificados', [GenerarCertificadoController::class, 'listarCertificadosProfesor']);

Route::get('/profesor/{idProfesor}/edicion/{edicion}/generar-certificados', [GenerarCertificadoController::class, 'generarCertificadosProfesor']);
Route::get('/profesor/{idProfesor}/edicion/{edicion}/certificados/zip', [GenerarCertificadoController::class, 'descargarZipProfesor']);

Route::get('/certificados/verificar/{hash}', [VerificarCertificadoController::class, 'verificar']);

Route::get('/medallas/edicion/{edicion}/calcular', [MedallasEdicionController::class, 'calcularYActualizar']);
Route::get('/medallas/edicion/{edicion}/resumen', [MedallasEdicionController::class, 'resumen']);
Route::get('/medallas/edicion/{edicion}/listado', [MedallasEdicionController::class, 'listado']);

Route::get('/calcular-medallas', [MedallasExcelController::class, 'formulario']);
Route::post('/calcular-medallas', [MedallasExcelController::class, 'calcular']);

Route::get('/profesor/{idProfesor}/edicion/{edicion}/certificados/vista', [GenerarCertificadoController::class, 'vistaCertificadosProfesor']);

Route::get('/profesor/dashboard', [GenerarCertificadoController::class, 'dashboardProfesor']);
Route::get('/coordinador/dashboard', [GenerarCertificadoController::class, 'dashboardCoordinador']);

Route::get('/profesor/mis-certificados', [GenerarCertificadoController::class, 'misCertificadosProfesor']);

Route::get('/coordinador/resultados-pendientes', [ResultadosPendientesController::class, 'index']);
Route::get('/coordinador/resultados-pendientes/{id}', [ResultadosPendientesController::class, 'show']);
Route::post('/coordinador/resultados-pendientes/{id}/revisar', [ResultadosPendientesController::class, 'marcarRevisado']);
Route::get('/coordinador/certificados-colaboradores', [CertificadosColaboradoresController::class, 'index']);

Route::get('/coordinador/certificados-colaboradores/generar/{idUser}', [GenerarCertificadoController::class, 'generarColaborador']);

Route::delete('/profesor/estudiante-edicion/{id}/excluir', [GenerarCertificadoController::class, 'excluirEstudianteEdicion']);

Route::get(
    '/coordinador/certificados-colaboradores/generar-todos',
    [GenerarCertificadoController::class, 'generarTodos']
);

Route::get('/coordinador/certificados-historicos', function () {
    return view('certificados.historicos.index');
});
