@extends('layouts.app')

@section('title', 'Resultados pendientes')

@section('page_title', 'Resultados pendientes')

@section('page_subtitle')
Resultados importados desde Excel que necesitan revisión del Coordinador Nacional.
@endsection

@section('content')

<div class="card">
    <p>
        <strong>Total mostrado:</strong> {{ count($pendientes) }}
    </p>
</div>

<div class="card">
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Escuela</th>
                <th>Categoría</th>
                <th>Puntuación</th>
                <th>Medalla</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </thead>

        <tbody>
            @forelse ($pendientes as $p)
            <tr>
                <td>{{ $p->id }}</td>
                <td>{{ $p->nombre_estudiante }}</td>
                <td>{{ $p->escuela_excel ?: 'No indicada' }}</td>
                <td>{{ $p->categoria_nombre }}</td>
                <td>{{ $p->puntuacion }}</td>
                <td>
                    @php
                    $claseMedalla = match($p->medalla) {
                    'Oro' => 'badge-gold',
                    'Plata' => 'badge-silver',
                    'Bronce' => 'badge-bronze',
                    default => 'badge-pending',
                    };
                    @endphp

                    <span class="badge {{ $claseMedalla }}">
                        {{ $p->medalla }}
                    </span>
                </td>
                <td>
                    <span class="badge badge-pending">
                        {{ $p->estado }}
                    </span>
                </td>
                <td>
                    <a class="btn btn-dark" href="/coordinador/resultados-pendientes/{{ $p->id }}">
                        Ver
                    </a>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8">
                    No existen resultados pendientes.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@endsection