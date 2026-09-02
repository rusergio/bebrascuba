<?php

namespace App\Http\Controllers;

use App\Models\Edicion;
use App\Models\ResultadoPendiente;
use App\Services\MedallasPendientesService;
use App\Services\VinculoResultadoPendienteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportarResultadosController extends Controller
{
    public function __construct(
        private readonly VinculoResultadoPendienteService $vinculoService,
    ) {}

    public function importar(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls|max:51200',
        ]);

        $edicion = Edicion::where('abierto', true)->first();
        if (!$edicion) {
            return $this->responderImportacion($request, [
                'success' => false,
                'message' => 'No hay una edición abierta. Abra una edición antes de importar resultados.',
            ], 422);
        }

        $nEdicion = (int) $edicion->n_edicion;
        $idEdicionInterno = (int) $edicion->id;

        $archivo = $request->file('archivo');

        try {
            $spreadsheet = IOFactory::load($archivo->getRealPath());
        } catch (\Throwable $e) {
            return $this->responderImportacion($request, [
                'success' => false,
                'message' => 'No se pudo leer el archivo Excel: ' . $e->getMessage(),
            ], 422);
        }

        $hojasIgnoradas = ['RESUMEN2025', 'RESUMEN2024', 'RESUMEN2023', 'RESUMEN'];

        $resumen = [];
        $profesoresEncontrados = [];
        $profesoresNoEncontrados = [];

        $contadores = [
            'preinscrito' => 0,
            'pendiente_no_preinscrito' => 0,
            'inconsistencia' => 0,
            'insertados' => 0,
            'actualizados' => 0,
            'duplicados' => 0,
        ];
        $pendientesPorCategoria = [];
        $estudiantesPresentesEnExcel = [];

        foreach ($spreadsheet->getSheetNames() as $nombreHoja) {
            if ($this->debeIgnorarHoja($nombreHoja, $hojasIgnoradas)) {
                continue;
            }

            $idCategoria = $this->obtenerIdCategoriaPorHoja($nombreHoja);
            $hoja = $spreadsheet->getSheetByName($nombreHoja);
            $highestRow = $hoja->getHighestRow();
            $highestColumn = $hoja->getHighestColumn();

            $encabezadosOriginales = $hoja->rangeToArray(
                'A1:' . $highestColumn . '1',
                null,
                true,
                true,
                true
            )[1];

            $mapaColumnas = $this->mapearColumnas($encabezadosOriginales);
            $filasValidas = 0;
            $muestras = [];

            for ($fila = 2; $fila <= $highestRow; $fila++) {
                $datosFila = $hoja->rangeToArray(
                    'A' . $fila . ':' . $highestColumn . $fila,
                    null,
                    true,
                    true,
                    true
                )[$fila];

                $correoProfesor = $this->valorPorCampo($datosFila, $mapaColumnas, 'correo_profesor');
                $nombreEstudiante = $this->valorPorCampo($datosFila, $mapaColumnas, 'nombre_estudiante');

                if (!$correoProfesor && !$nombreEstudiante) {
                    continue;
                }

                $filasValidas++;

                if (count($muestras) < 3) {
                    $muestras[] = [
                        'correo_profesor' => $correoProfesor,
                        'nombre_estudiante' => $nombreEstudiante,
                        'escuela' => $this->valorPorCampo($datosFila, $mapaColumnas, 'escuela'),
                        'score' => $this->valorPorCampo($datosFila, $mapaColumnas, 'score'),
                    ];
                }

                $validacion = $this->validarFilaImportacion(
                    $nEdicion,
                    $correoProfesor,
                    $nombreEstudiante,
                    $this->valorPorCampo($datosFila, $mapaColumnas, 'student_username'),
                    $this->valorPorCampo($datosFila, $mapaColumnas, 'escuela'),
                    $profesoresEncontrados,
                    $profesoresNoEncontrados,
                );

                if ($validacion['id_estudiante']) {
                    $estudiantesPresentesEnExcel[$validacion['id_estudiante']] = true;
                }

                $puntuacion = $this->valorPorCampo($datosFila, $mapaColumnas, 'score');
                $attrs = [
                    'edicion' => $nEdicion,
                    'id_categoria' => $idCategoria,
                    'correo_profesor' => $validacion['correo_profesor'],
                    'nombre_profesor' => $validacion['nombre_profesor'],
                    'id_profesor' => $validacion['id_profesor'],
                    'student_username' => $this->valorPorCampo($datosFila, $mapaColumnas, 'student_username'),
                    'nombre_estudiante' => trim((string) $nombreEstudiante),
                    'id_estudiante' => $validacion['id_estudiante'],
                    'sexo' => $this->valorPorCampo($datosFila, $mapaColumnas, 'sexo'),
                    'escuela_excel' => $this->valorPorCampo($datosFila, $mapaColumnas, 'escuela'),
                    'id_escuela' => $validacion['id_escuela'],
                    'grado' => null,
                    'puntuacion' => $puntuacion !== null && $puntuacion !== '' ? (int) $puntuacion : null,
                    'medalla' => null,
                    'datos_faltantes' => $validacion['datos_faltantes'],
                    'descripcion_estado' => $validacion['descripcion_estado'],
                    'observaciones' => 'Importado automáticamente desde Excel Ville.',
                    'estado' => $validacion['estado_validacion'],
                    'estado_validacion' => $validacion['estado_validacion'],
                    'requiere_aprobacion' => $validacion['estado_validacion'] !== 'preinscrito',
                    'editado_por_profesor' => false,
                    'aprobado_por_coordinador' => false,
                ];

                $resultado = $this->guardarPendiente($nEdicion, $attrs);

                if ($resultado === 'insertado') {
                    $contadores['insertados']++;
                    $contadores[$validacion['estado_validacion']]++;
                    $pendientesPorCategoria[$nombreHoja] = ($pendientesPorCategoria[$nombreHoja] ?? 0) + 1;
                } elseif ($resultado === 'actualizado') {
                    $contadores['actualizados']++;
                } else {
                    $contadores['duplicados']++;
                }
            }

            $resumen[$nombreHoja] = [
                'filas_validas' => $filasValidas,
                'columnas_detectadas' => $mapaColumnas,
                'muestras' => $muestras,
            ];
        }

        $medallasResumen = (new MedallasPendientesService())->calcularParaEdicion($nEdicion);
        $ausentes = $this->detectarAusentes($idEdicionInterno, array_keys($estudiantesPresentesEnExcel));

        $totalFilasValidas = (int) array_sum(array_map(
            fn (array $hoja) => $hoja['filas_validas'] ?? 0,
            $resumen
        ));

        $payload = [
            'success' => true,
            'message' => 'Importación completada. Todos los registros están en resultados_pendientes para revisión.',
            'data' => [
                'edicion' => $nEdicion,
                'a_edicion' => $edicion->a_edicion,
                'total_filas_validas' => $totalFilasValidas,
                'preinscritos' => $contadores['preinscrito'],
                'pendiente_no_preinscrito' => $contadores['pendiente_no_preinscrito'],
                'inconsistencias' => $contadores['inconsistencia'],
                'pendientes_insertados' => $contadores['insertados'],
                'pendientes_actualizados' => $contadores['actualizados'],
                'pendientes_duplicados' => $contadores['duplicados'],
                'profesores_encontrados' => count($profesoresEncontrados),
                'profesores_no_encontrados' => count($profesoresNoEncontrados),
                'pendientes_por_categoria' => $pendientesPorCategoria,
                'medallas' => $medallasResumen,
                'ausentes' => $ausentes,
                'hojas_procesadas' => array_keys($resumen),
            ],
        ];

        return $this->responderImportacion($request, $payload);
    }

    private function validarFilaImportacion(
        int $nEdicion,
        ?string $correoProfesor,
        ?string $nombreEstudiante,
        ?string $studentUsername,
        ?string $escuelaExcel,
        array &$profesoresEncontrados,
        array &$profesoresNoEncontrados,
    ): array {
        $validacion = $this->vinculoService->validarParaImportacion(
            $nEdicion,
            $correoProfesor,
            $nombreEstudiante,
            $studentUsername,
            $escuelaExcel,
        );

        $correo = $validacion['correo_profesor'] ?? null;
        if ($correo) {
            if ($validacion['id_profesor']) {
                $profesoresEncontrados[$correo] = true;
            } elseif (str_contains($validacion['datos_faltantes'] ?? '', 'No existe profesor')) {
                $profesoresNoEncontrados[$correo] = true;
            } elseif (str_contains($validacion['datos_faltantes'] ?? '', 'perfil de profesor')) {
                $profesoresNoEncontrados[$correo] = true;
            }
        }

        return $validacion;
    }

    private function guardarPendiente(int $nEdicion, array $attrs): string
    {
        if (empty($attrs['nombre_estudiante']) || empty($attrs['correo_profesor'])) {
            return 'ignorado';
        }

        $existente = ResultadoPendiente::where('correo_profesor', $attrs['correo_profesor'])
            ->where('nombre_estudiante', $attrs['nombre_estudiante'])
            ->where('edicion', $nEdicion)
            ->first();

        if ($existente) {
            if ($existente->estado_validacion === 'insertado_historico') {
                return 'duplicado';
            }

            $existente->update($attrs);

            return 'actualizado';
        }

        ResultadoPendiente::create($attrs);

        return 'insertado';
    }

    private function detectarAusentes(int $idEdicionInterno, array $idsPresentes): array
    {
        $consulta = DB::table('profesor_estudiante as pe')
            ->join('estudiantes as e', 'e.id', '=', 'pe.id_estudiante')
            ->leftJoin('profesores as p', 'p.id', '=', 'pe.id_profesor')
            ->leftJoin('users as u', 'u.id', '=', 'p.user_id')
            ->where('pe.edicion', $idEdicionInterno);

        if (!empty($idsPresentes)) {
            $consulta->whereNotIn('pe.id_estudiante', $idsPresentes);
        }

        $ausentes = $consulta
            ->select(
                'e.id as estudiante_id',
                'e.nombre as nombre_estudiante',
                'u.correo as correo_profesor'
            )
            ->get();

        return [
            'cantidad' => $ausentes->count(),
            'muestras' => $ausentes->take(10)->values(),
        ];
    }

    private function debeIgnorarHoja(string $nombreHoja, array $ignoradas): bool
    {
        if (in_array($nombreHoja, $ignoradas, true)) {
            return true;
        }

        return str_starts_with(strtoupper($nombreHoja), 'RESUMEN');
    }

    private function responderImportacion(Request $request, array $payload, int $status = 200)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json($payload, $status);
        }

        if (($payload['success'] ?? false) === false) {
            return redirect('/importar-resultados')->with('error', $payload['message'] ?? 'Error al importar.');
        }

        $data = $payload['data'] ?? [];

        return redirect('/importar-resultados')->with('success', [
            'mensaje' => $payload['message'] ?? 'Archivo importado correctamente.',
            'total_procesados' => $data['total_filas_validas'] ?? null,
            'total_preinscritos' => $data['preinscritos'] ?? null,
            'total_pendientes' => $data['pendientes_insertados'] ?? null,
        ]);
    }

    private function mapearColumnas(array $encabezados): array
    {
        $mapa = [];

        foreach ($encabezados as $columna => $titulo) {
            if ($titulo === null) {
                continue;
            }

            $normalizado = $this->normalizarTexto((string) $titulo);

            if (in_array($normalizado, [
                'teacher email',
                'teacher e mail',
                'teacher e-mail',
                'correo electronico del profesor',
                'correo del profesor',
                'email profesor',
                'e mail profesor',
            ])) {
                $mapa['correo_profesor'] = $columna;
            }

            if (in_array($normalizado, ['group name', 'nombre del grupo'])) {
                $mapa['grupo'] = $columna;
            }

            if (in_array($normalizado, ['school', 'escuela'])) {
                $mapa['escuela'] = $columna;
            }

            if (in_array($normalizado, ['student username', 'nombre de usuario del estudiante'])) {
                $mapa['student_username'] = $columna;
            }

            if (in_array($normalizado, ['student name', 'nombre del estudiante'])) {
                $mapa['nombre_estudiante'] = $columna;
            }

            if (in_array($normalizado, ['gender', 'student gender', 'genero'])) {
                $mapa['sexo'] = $columna;
            }

            if (in_array($normalizado, ['score', 'puntuacion'])) {
                $mapa['score'] = $columna;
            }

            if (in_array($normalizado, ['medalla', 'medallas'])) {
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

        $columna = $mapaColumnas[$campo];
        $valor = $fila[$columna] ?? null;

        return is_string($valor) ? trim($valor) : $valor;
    }

    private function normalizarTexto(string $texto): string
    {
        return $this->vinculoService->normalizarTexto($texto);
    }

    private function obtenerIdCategoriaPorHoja(string $nombreHoja): int
    {
        $nombre = $this->normalizarTexto($nombreHoja);

        if (str_contains($nombre, 'superpeque') || str_contains($nombre, 'pre primary')) {
            return 1;
        }

        if (str_contains($nombre, 'peque') || str_contains($nombre, 'primary')) {
            return 2;
        }

        if (str_contains($nombre, 'benjamin')) {
            return 3;
        }

        if (str_contains($nombre, 'cadete')) {
            return 4;
        }

        if (str_contains($nombre, 'junior')) {
            return 5;
        }

        if (str_contains($nombre, 'senior')) {
            return 6;
        }

        return 7;
    }
}
