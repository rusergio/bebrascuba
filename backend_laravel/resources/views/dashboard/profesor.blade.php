@extends('layouts.app')

@section('title', 'Panel del profesor')

@section('page_title', 'Panel del profesor')

@section('page_subtitle')
    Acceso rápido a las funciones principales del profesor.
@endsection

@section('content')

    <div class="card">
        <h2>Resumen</h2>

        <p>
            Desde este panel el profesor puede consultar, verificar y descargar
            los certificados generados para sus estudiantes, así como revisar
            la participación registrada en la edición actual.
        </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">

        <div class="card">
            <h3>Mis certificados</h3>
            <p>Consultar, verificar y descargar certificados de tus estudiantes.</p>

            <a class="btn" href="/profesor/mis-certificados">
                Abrir certificados
            </a>
        </div>

    </div>

@endsection
