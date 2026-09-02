@extends('layouts.app')

@section('title', 'Calcular medallas')

@section('page_title', 'Calcular medallas')

@section('page_subtitle')
    Cálculo automático de medallas a partir del Excel oficial de resultados.
@endsection

@section('content')

    @if (session('resultado_medallas'))
        @php
            $datos = session('resultado_medallas');
        @endphp

        <div class="card" style="border-left: 6px solid #16a34a;">
            <h3>Cálculo completado</h3>

            <p><strong>Archivo:</strong> {{ $datos['filename'] }}</p>
            <p><strong>Total de diferencias:</strong> {{ $datos['total_diferencias'] }}</p>
        </div>

        @foreach ($datos['resultado'] as $categoria => $resultado)
            <div class="card">
                <h3>{{ $categoria }}</h3>

                <p><strong>Participantes:</strong> {{ $resultado['cantidad_participantes'] }}</p>
                <p><strong>Válidos para medalla:</strong> {{ $resultado['cantidad_validos'] }}</p>

                <p>
                    <strong>Cortes:</strong>
                    Oro desde {{ $resultado['oro_desde'] ?? '-' }},
                    Plata desde {{ $resultado['plata_desde'] ?? '-' }},
                    Bronce desde {{ $resultado['bronce_desde'] ?? '-' }}
                </p>

                <table>
                    <thead>
                        <tr>
                            <th>Oro</th>
                            <th>Plata</th>
                            <th>Bronce</th>
                            <th>Participa</th>
                            <th>Diferencias</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ $resultado['resumen_medallas']['Oro'] ?? 0 }}</td>
                            <td>{{ $resultado['resumen_medallas']['Plata'] ?? 0 }}</td>
                            <td>{{ $resultado['resumen_medallas']['Bronce'] ?? 0 }}</td>
                            <td>{{ $resultado['resumen_medallas']['Participa'] ?? 0 }}</td>
                            <td>{{ $resultado['cantidad_diferencias'] }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        @endforeach
    @endif

    <div class="card">
        <h2>Subir Excel de resultados</h2>

        <p>
            Esta herramienta permite comparar las medallas presentes en el Excel con las medallas
            calculadas automáticamente por el sistema según las reglas definidas.
        </p>

        <form method="POST" action="/calcular-medallas" enctype="multipart/form-data">
            @csrf

            <div style="margin-bottom: 18px;">
                <label><strong>Archivo Excel:</strong></label><br><br>
                <input type="file" name="archivo" required>
            </div>

            <button class="btn btn-warning" type="submit">
                Calcular medallas
            </button>

            <a class="btn btn-dark" href="/coordinador/dashboard">
                Volver
            </a>
        </form>
    </div>

@endsection
