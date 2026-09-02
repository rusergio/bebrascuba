@extends('layouts.app')

@section('title', 'Importar resultados')

@section('page_title', 'Importar resultados')

@section('page_subtitle')
    Carga del Excel oficial de resultados del concurso Bebras Cuba.
@endsection

@section('content')

    @if (session('success'))
        <div class="card" style="border-left: 6px solid #16a34a;">
            <h3>Importación completada</h3>
            <p>{{ session('success.mensaje') }}</p>

            <ul>
                @if (session('success.total_procesados') !== null)
                    <li><strong>Total procesados:</strong> {{ session('success.total_procesados') }}</li>
                @endif

                @if (session('success.total_actualizados') !== null)
                    <li><strong>Actualizados:</strong> {{ session('success.total_actualizados') }}</li>
                @endif

                @if (session('success.total_pendientes') !== null)
                    <li><strong>Pendientes:</strong> {{ session('success.total_pendientes') }}</li>
                @endif
            </ul>

            <a class="btn btn-warning" href="/coordinador/resultados-pendientes">
                Ver resultados pendientes
            </a>
        </div>
    @endif

    <div class="card">
        <h2>Subir archivo Excel</h2>

        <p>
            Desde esta pantalla el Coordinador Nacional puede cargar el archivo oficial de resultados.
            El sistema procesará los estudiantes preinscritos y enviará a pendientes aquellos registros
            que no puedan asociarse automáticamente.
        </p>

        <form method="POST" action="/importar-resultados" enctype="multipart/form-data">
            @csrf

            <div style="margin-bottom: 18px;">
                <label><strong>Archivo Excel:</strong></label><br><br>
                <input type="file" name="archivo" required>
            </div>

            <button class="btn" type="submit">
                Importar resultados
            </button>

            <a class="btn btn-dark" href="/coordinador/dashboard">
                Volver
            </a>
        </form>
    </div>

    <div class="card">
        <h3>Resultado esperado del proceso</h3>

        <ul>
            <li>Lectura de todas las hojas de categorías.</li>
            <li>Normalización de nombres de columnas.</li>
            <li>Actualización de estudiantes preinscritos.</li>
            <li>Registro de resultados no asociables como pendientes.</li>
            <li>Prevención de duplicados en reimportaciones.</li>
        </ul>
    </div>

@endsection
