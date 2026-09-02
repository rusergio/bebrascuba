@extends('layouts.app')

@section('title', 'Plantillas')

@section('page_title', 'Plantillas de certificados')

@section('page_subtitle')
    Administración de plantillas utilizadas para generar certificados.
@endsection

@section('content')

    @if (session('success'))
        <div class="card" style="border-left:6px solid #16a34a;">
            <h3>{{ session('success') }}</h3>
        </div>
    @endif

    <div class="card">
        <h2>Subir nueva plantilla</h2>

        <form method="POST" action="/plantillas-certificados" enctype="multipart/form-data">

            @csrf

            <div style="margin-bottom:12px;">
                <label>Nombre</label><br>
                <input type="text" name="nombre" required autocomplete="off" placeholder="Ej: Certificado Oro 2025"
                    style="width:100%; padding:8px;">
            </div>

            <div style="margin-bottom:12px;">
                <label>Tipo</label><br>
                <select name="tipo" required style="width:100%; padding:8px;">
                    <option value="estudiante">Estudiante</option>
                    <option value="maestro_colaborador">Maestro / Colaborador</option>
                </select>
            </div>

            <div style="margin-bottom:12px;">
                <label>Categoría</label><br>
                <select name="categoria" style="width:100%; padding:8px;">
                    <option value="">Todas / No aplica</option>
                    <option value="SuperPeque">SuperPeque</option>
                    <option value="Peque">Peque</option>
                    <option value="Benjamín">Benjamín</option>
                    <option value="Cadete">Cadete</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                </select>
            </div>

            <div style="margin-bottom:12px;">
                <label>Medalla</label><br>
                <select name="medalla" style="width:100%; padding:8px;">
                    <option value="">No aplica</option>
                    <option value="Participa">Participación</option>
                    <option value="Bronce">Bronce</option>
                    <option value="Plata">Plata</option>
                    <option value="Oro">Oro</option>
                </select>
            </div>

            <div style="margin-bottom:12px;">
                <label>Archivo</label><br>
                <input type="file" name="archivo" required>
            </div>

            <button class="btn">
                Subir plantilla
            </button>
        </form>
    </div>

    <div class="card">
        <h2>Plantillas registradas</h2>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Medalla</th>
                    <th>Activa</th>
                    <th>Acción</th>
                </tr>
            </thead>

            <tbody>
                @foreach ($plantillas as $plantilla)
                    <tr>
                        <td>{{ $plantilla->id }}</td>
                        <td>{{ $plantilla->nombre }}</td>
                        <td>{{ $plantilla->tipo }}</td>
                        <td>{{ $plantilla->categoria }}</td>
                        <td>{{ $plantilla->medalla }}</td>
                        <td>
                            @if ($plantilla->activa)
                                <span class="badge badge-ok">Activa</span>
                            @else
                                <span class="badge badge-pending">Inactiva</span>
                            @endif
                        </td>
                        <td>
                            @if ($plantilla->activa)
                                <form method="POST" action="/plantillas-certificados/{{ $plantilla->id }}/desactivar">
                                    @csrf
                                    <button class="btn btn-warning">
                                        Desactivar
                                    </button>
                                </form>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

@endsection
