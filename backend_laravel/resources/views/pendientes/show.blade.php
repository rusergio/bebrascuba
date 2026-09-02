@extends('layouts.app')

@section('title', 'Detalle del pendiente')

@section('page_title', 'Detalle del resultado pendiente')

@section('page_subtitle')
    Revisión individual del registro importado desde Excel.
@endsection

@section('content')

@php
    $estadoTexto = $pendiente->estado === 'pendiente' ? 'Pendiente' : 'Revisado';
    $estadoClase = $pendiente->estado === 'pendiente' ? 'badge-pending' : 'badge-ok';

    $sexo = match(strtolower($pendiente->sexo ?? '')) {
        'male' => 'Masculino',
        'female' => 'Femenino',
        default => $pendiente->sexo ?: 'No indicado',
    };
@endphp

<div class="card">
    <div class="actions">
        <a class="btn btn-dark" href="/coordinador/resultados-pendientes">
            Volver
        </a>

        @if($pendiente->estado === 'pendiente')
            <form method="POST" action="/coordinador/resultados-pendientes/{{ $pendiente->id }}/revisar">
                @csrf
                <button class="btn btn-success" type="submit">
                    Marcar revisado
                </button>
            </form>
        @endif
    </div>

    <h2>{{ $pendiente->nombre_estudiante }}</h2>

    <p>
        <span class="badge {{ $estadoClase }}">
            {{ $estadoTexto }}
        </span>
    </p>
</div>

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">

    <div class="card">
        <h3>Datos del estudiante</h3>

        <p><strong>Nombre:</strong> {{ $pendiente->nombre_estudiante }}</p>
        <p><strong>Usuario:</strong> {{ $pendiente->student_username ?? 'No indicado' }}</p>
        <p><strong>Sexo:</strong> {{ $sexo }}</p>
        <p><strong>Grado:</strong> {{ $pendiente->grado ?? 'No indicado' }}</p>
    </div>

    <div class="card">
        <h3>Resultado</h3>

        <p><strong>Categoría:</strong> {{ $pendiente->categoria_nombre }}</p>
        <p><strong>Puntuación:</strong> {{ $pendiente->puntuacion }}</p>
        <p><strong>Medalla:</strong> {{ $pendiente->medalla }}</p>
        <p><strong>Edición:</strong> {{ $pendiente->edicion }}</p>
    </div>

    <div class="card">
        <h3>Profesor / contacto</h3>

        <p><strong>Profesor:</strong> {{ $pendiente->nombre_profesor ?: 'No indicado' }}</p>
        <p><strong>Correo:</strong> {{ $pendiente->correo_profesor ?: 'No indicado' }}</p>
    </div>

    <div class="card">
        <h3>Escuela</h3>

        <p><strong>Escuela indicada en Excel:</strong> {{ $pendiente->escuela_excel ?: 'No indicada' }}</p>
        <p><strong>Importado:</strong> {{ $pendiente->created_at }}</p>
        <p><strong>Última actualización:</strong> {{ $pendiente->updated_at }}</p>
    </div>

</div>

<div class="card">
    <h3>Observaciones</h3>

    <p><strong>Datos faltantes:</strong></p>
    <p>{{ $pendiente->datos_faltantes ?: 'No se registraron datos faltantes.' }}</p>

    <p><strong>Observaciones:</strong></p>
    <p>{{ $pendiente->observaciones ?: 'Sin observaciones.' }}</p>
</div>

@endsection