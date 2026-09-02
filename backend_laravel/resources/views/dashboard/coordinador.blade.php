@extends('layouts.app')

@section('title', 'Panel del coordinador')

@section('page_title', 'Panel del coordinador nacional')

@section('page_subtitle')
    Gestión general de resultados, medallas, plantillas y certificados del concurso.
@endsection

@section('content')

    <div class="card">
        <h2>Resumen del sistema</h2>

        <p>
            Desde este panel el Coordinador Nacional puede importar resultados,
            revisar pendientes, calcular medallas, administrar plantillas y generar certificados.
        </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">

        <div class="card">
            <h3>Importar resultados</h3>
            <p>Cargar el Excel oficial de resultados y procesar estudiantes preinscritos o pendientes.</p>

            <a class="btn" href="/importar-resultados">
                Abrir importación
            </a>
        </div>

        <div class="card">
            <h3>Medallas</h3>
            <p>Calcular y revisar la propuesta automática de medallas por categoría.</p>

            <a class="btn btn-warning" href="/calcular-medallas">
                Abrir medallas
            </a>
        </div>

        <div class="card">
            <h3>Plantillas</h3>
            <p>Consultar las plantillas activas para certificados de participación y medallas.</p>

            <a class="btn btn-dark" href="/plantillas-certificados">
                Ver plantillas
            </a>
        </div>

        <div class="card">
            <h3>Certificados</h3>
            <p>Generar certificados de estudiantes por edición y permitir su verificación mediante QR.</p>

            <a class="btn btn-success" href="/profesor/mis-certificados">
                Ver certificados de estudiantes
            </a>
        </div>

        <div class="card">
            <h3>Certificados históricos</h3>
            <p>Gestionar y consultar certificados históricos importados al sistema.</p>

            <a class="btn btn-dark" href="/coordinador/certificados-historicos">
                Abrir históricos
            </a>
        </div>

        <div class="card">
            <h3>Resultados pendientes</h3>
            <p>Revisar registros del Excel que no pudieron asociarse automáticamente.</p>

            <a class="btn btn-warning" href="/coordinador/resultados-pendientes">
                Ver pendientes
            </a>
        </div>

        <div class="card">
            <h3>Certificados maestro/colaborador</h3>
            <p>Generar certificados para profesores y colaboradores del concurso.</p>

            <a class="btn btn-dark" href="/coordinador/certificados-colaboradores">
                Ver colaboradores
            </a>
        </div>

    </div>

@endsection
