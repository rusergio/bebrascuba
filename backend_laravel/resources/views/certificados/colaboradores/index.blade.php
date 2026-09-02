@extends('layouts.app')

@section('title', 'Certificados maestro/colaborador')

@section('page_title', 'Certificados maestro/colaborador')

@section('page_subtitle')
    Generación de certificados para profesores y colaboradores del concurso Bebras Cuba.
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
        <p>
            <strong>Total:</strong> {{ count($usuarios) }}
        </p>
    </div>

    <div class="card">

        <div class="actions">

            <a class="btn btn-success" href="/coordinador/certificados-colaboradores/generar-todos">
                Generar todos los certificados
            </a>

        </div>

        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                @forelse($usuarios as $usuario)
                    <tr>
                        <td>{{ $usuario->nombre }} {{ $usuario->apellidos }}</td>
                        <td>{{ $usuario->correo }}</td>
                        <td>
                            <span class="badge badge-ok">
                                {{ $usuario->rol }}
                            </span>
                        </td>
                        <td>
                            @if ($usuario->ruta_archivo)
                                <a class="btn btn-dark" href="{{ asset('storage/' . $usuario->ruta_archivo) }}"
                                    target="_blank">
                                    Ver
                                </a>

                                <a class="btn btn-warning" href="/certificados/verificar/{{ $usuario->hash }}"
                                    target="_blank">
                                    Verificar
                                </a>
                            @else
                                <a class="btn btn-dark"
                                    href="/coordinador/certificados-colaboradores/generar/{{ $usuario->id }}">
                                    Generar certificado
                                </a>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4">No existen profesores o colaboradores registrados.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

@endsection
