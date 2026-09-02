@extends('layouts.app')

@section('title', 'Mis certificados')

@section('page_title', 'Mis certificados')

@section('page_subtitle')
    Consulta, verifica y descarga los certificados generados para sus estudiantes.
@endsection

@section('content')

    @if (session('success'))
        <div class="card" style="border-left:6px solid #16a34a;">
            {{ session('success') }}
        </div>
    @endif

    @if (session('error'))
        <div class="card" style="border-left:6px solid #dc2626;">
            {{ session('error') }}
        </div>
    @endif

    <div class="card">
        <div class="actions">
            <a class="btn" href="/profesor/{{ $idProfesor }}/edicion/{{ $edicion }}/generar-certificados">
                Generar certificados
            </a>

            <a class="btn btn-success" href="/profesor/{{ $idProfesor }}/edicion/{{ $edicion }}/certificados/zip">
                Descargar ZIP
            </a>
        </div>

        <p>
            <strong>Estudiantes que participaron:</strong> {{ count($estudiantes) }}
        </p>

        <p>
            <strong>Estudiantes que no participaron:</strong> {{ count($estudiantesNoParticiparon) }}
        </p>
    </div>

    <div class="card">
        <h2>Estudiantes que participaron</h2>

        <table>
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Escuela</th>
                    <th>Categoría</th>
                    <th>Puntuación</th>
                    <th>Medalla</th>
                    <th>Estado</th>
                    <th>Certificado</th>
                    <th>Verificación</th>
                </tr>
            </thead>

            <tbody>
                @forelse ($estudiantes as $estudiante)
                    <tr>
                        <td>{{ $estudiante['estudiante'] }}</td>
                        <td>{{ $estudiante['escuela'] }}</td>
                        <td>{{ $estudiante['categoria'] }}</td>
                        <td>{{ $estudiante['puntuacion'] }}</td>

                        <td>
                            @php
                                $medalla = $estudiante['medalla'];
                                $medallaNormalizada = ucfirst(mb_strtolower($medalla ?? 'Participa', 'UTF-8'));

                                $claseMedalla = match ($medallaNormalizada) {
                                    'Oro' => 'badge-gold',
                                    'Plata' => 'badge-silver',
                                    'Bronce' => 'badge-bronze',
                                    default => 'badge-pending',
                                };
                            @endphp

                            <span class="badge {{ $claseMedalla }}">
                                {{ $medalla }}
                            </span>
                        </td>

                        <td>
                            @if ($estudiante['certificado_generado'])
                                <span class="badge badge-ok">Generado</span>
                            @else
                                <span class="badge badge-pending">Pendiente</span>
                            @endif
                        </td>

                        <td>
                            @if ($estudiante['url_certificado'])
                                <a class="btn btn-dark" href="{{ $estudiante['url_certificado'] }}" target="_blank">
                                    Ver
                                </a>
                            @else
                                -
                            @endif
                        </td>

                        <td>
                            @if ($estudiante['url_verificacion'])
                                <a class="btn btn-warning" href="{{ $estudiante['url_verificacion'] }}" target="_blank">
                                    Verificar
                                </a>
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8">
                            No hay estudiantes con resultados para esta edición.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="card">
        <h2>Estudiantes preinscritos sin participación registrada</h2>

        <p>
            Estos estudiantes estaban preinscritos en la edición, pero no aparecen en el Excel oficial de resultados.
            Por tanto, no cuentan oficialmente para resultados, medallas ni certificados de esta edición.
        </p>

        <table>
            <thead>
                <tr>
                    <th>Estudiante</th>
                    <th>Escuela</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                </tr>
            </thead>

            <tbody>
                @forelse ($estudiantesNoParticiparon as $estudiante)
                    <tr>
                        <td>{{ $estudiante['estudiante'] }}</td>
                        <td>{{ $estudiante['escuela'] }}</td>
                        <td>{{ $estudiante['categoria'] }}</td>
                        <td>
                            <span class="badge badge-pending">
                                No participó
                            </span>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4">
                            No hay estudiantes preinscritos sin participación en esta edición.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

@endsection
