<?php

namespace App\Http\Controllers;

use App\Services\CalculoMedallasService;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MedallasExcelController extends Controller
{
    public function formulario()
    {
        return view('calcular-medallas');
    }

    public function calcular(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls'
        ]);

        $archivo = $request->file('archivo');
        $spreadsheet = IOFactory::load($archivo->getRealPath());

        $servicio = new CalculoMedallasService();

        $hojasIgnoradas = ['RESUMEN2025'];
        $resultado = [];

        $totalDiferencias = 0;

        foreach ($spreadsheet->getSheetNames() as $nombreHoja) {
            if (in_array($nombreHoja, $hojasIgnoradas)) {
                continue;
            }

            $hoja = $spreadsheet->getSheetByName($nombreHoja);
            $highestRow = $hoja->getHighestRow();
            $highestColumn = $hoja->getHighestColumn();

            $encabezados = $hoja->rangeToArray(
                'A1:' . $highestColumn . '1',
                null,
                true,
                true,
                true
            )[1];

            $mapaColumnas = $this->mapearColumnas($encabezados);

            $participantes = [];

            for ($fila = 2; $fila <= $highestRow; $fila++) {
                $datosFila = $hoja->rangeToArray(
                    'A' . $fila . ':' . $highestColumn . $fila,
                    null,
                    true,
                    true,
                    true
                )[$fila];

                $nombreEstudiante = $this->valorPorCampo($datosFila, $mapaColumnas, 'nombre_estudiante');
                $puntuacion = $this->valorPorCampo($datosFila, $mapaColumnas, 'score');

                if (!$nombreEstudiante && $puntuacion === null) {
                    continue;
                }

                $participantes[] = [
                    'correo_profesor' => $this->valorPorCampo($datosFila, $mapaColumnas, 'correo_profesor'),
                    'nombre_estudiante' => $nombreEstudiante,
                    'student_username' => $this->valorPorCampo($datosFila, $mapaColumnas, 'student_username'),
                    'puntuacion' => $puntuacion,
                    'medalla_excel' => $this->normalizarMedalla(
                        $this->valorPorCampo($datosFila, $mapaColumnas, 'medalla')
                    ),
                ];
            }

            $calculo = $servicio->calcularPorCategoria($nombreHoja, $participantes);

            $diferencias = [];

            foreach ($calculo['participantes'] as $participante) {
                $medallaExcel = $this->normalizarMedalla($participante['medalla_excel'] ?? null);
                $medallaCalculada = $this->normalizarMedalla($participante['medalla_calculada'] ?? null);

                if ($medallaExcel !== $medallaCalculada) {
                    $diferencias[] = [
                        'nombre_estudiante' => $participante['nombre_estudiante'],
                        'student_username' => $participante['student_username'] ?? null,
                        'puntuacion' => $participante['puntuacion'],
                        'medalla_excel' => $medallaExcel,
                        'medalla_calculada' => $medallaCalculada,
                    ];
                }
            }

            $totalDiferencias += count($diferencias);

            $resultado[$nombreHoja] = [
                'cantidad_participantes' => $calculo['cantidad_participantes'],
                'cantidad_validos' => $calculo['cantidad_validos'],
                'oro_desde' => $calculo['oro_desde'],
                'plata_desde' => $calculo['plata_desde'],
                'bronce_desde' => $calculo['bronce_desde'],
                'resumen_medallas' => $this->resumirMedallas($calculo['participantes']),
                'cantidad_diferencias' => count($diferencias),
                'diferencias' => $diferencias,
                'muestras' => array_slice($calculo['participantes'], 0, 10),
            ];
        }

        return redirect('/calcular-medallas')->with('resultado_medallas', [
            'message' => 'Medallas calculadas desde Excel completo.',
            'filename' => $archivo->getClientOriginalName(),
            'total_diferencias' => $totalDiferencias,
            'resultado' => $resultado,
        ]);
    }

    private function resumirMedallas(array $participantes): array
    {
        $resumen = [
            'Oro' => 0,
            'Plata' => 0,
            'Bronce' => 0,
            'Participa' => 0,
        ];

        foreach ($participantes as $participante) {
            $medalla = $this->normalizarMedalla($participante['medalla_calculada'] ?? 'Participa');

            if (!isset($resumen[$medalla])) {
                $resumen[$medalla] = 0;
            }

            $resumen[$medalla]++;
        }

        return $resumen;
    }

    private function mapearColumnas(array $encabezados): array
    {
        $mapa = [];

        foreach ($encabezados as $columna => $titulo) {
            if ($titulo === null) {
                continue;
            }

            $normalizado = $this->normalizarTexto($titulo);

            if (in_array($normalizado, [
                'teacher email',
                'correo electronico del profesor',
                'correo del profesor',
                'email profesor'
            ])) {
                $mapa['correo_profesor'] = $columna;
            }

            if (in_array($normalizado, [
                'student username',
                'nombre de usuario del estudiante'
            ])) {
                $mapa['student_username'] = $columna;
            }

            if (in_array($normalizado, [
                'student name',
                'nombre del estudiante'
            ])) {
                $mapa['nombre_estudiante'] = $columna;
            }

            if (in_array($normalizado, [
                'score',
                'puntuacion'
            ])) {
                $mapa['score'] = $columna;
            }

            if (in_array($normalizado, [
                'medalla',
                'medallas',
                'plan segun reglas establecidas'
            ])) {
                $mapa['medalla'] = $columna;
            }
        }

        return $mapa;
    }

    private function valorPorCampo(array $fila, array $mapaColumnas, string $campo)
    {
        if (!isset($mapaColumnas[$campo])) {
            return null;
        }

        return $fila[$mapaColumnas[$campo]] ?? null;
    }

    private function normalizarTexto(string $texto): string
    {
        $texto = trim($texto);
        $texto = mb_strtolower($texto, 'UTF-8');

        $buscar = ['á', 'é', 'í', 'ó', 'ú', 'ñ'];
        $reemplazar = ['a', 'e', 'i', 'o', 'u', 'n'];

        return str_replace($buscar, $reemplazar, $texto);
    }

    private function normalizarMedalla($medalla): string
    {
        if ($medalla === null || trim((string) $medalla) === '') {
            return 'Participa';
        }

        $medalla = trim((string) $medalla);
        $normalizada = $this->normalizarTexto($medalla);

        return match ($normalizada) {
            'oro' => 'Oro',
            'plata' => 'Plata',
            'bronce' => 'Bronce',
            'participa', 'participacion', 'participante' => 'Participa',
            default => $medalla,
        };
    }
}
