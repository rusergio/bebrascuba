<?php

namespace App\Services;

use App\Models\Edicion;
use App\Models\Estudiante;
use App\Models\Profesor;
use App\Models\ProfesorEstudiante;
use App\Models\ResultadoPendiente;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Resuelve id_profesor, id_estudiante e id_escuela a partir de Teacher Email + nombre del estudiante.
 */
class VinculoResultadoPendienteService
{
    private const UMBRAL_SIMILITUD = 88.0;

    public function idEdicionInterno(int $nEdicion): ?int
    {
        return Edicion::where('n_edicion', $nEdicion)->value('id');
    }

    /**
     * @return array{
     *   id_profesor: ?int,
     *   nombre_profesor: ?string,
     *   correo_profesor: ?string,
     *   id_estudiante: ?int,
     *   id_escuela: ?int,
     *   metodo_vinculo: ?string,
     *   descripcion_estado: ?string,
     *   datos_faltantes: ?string
     * }
     */
    public function resolver(
        int $nEdicion,
        ?string $correoProfesor,
        ?string $nombreEstudiante,
        ?string $studentUsername = null,
        ?string $escuelaExcel = null,
    ): array {
        $base = [
            'id_profesor' => null,
            'nombre_profesor' => null,
            'correo_profesor' => $correoProfesor ? $this->normalizarCorreo($correoProfesor) : null,
            'id_estudiante' => null,
            'id_escuela' => null,
            'metodo_vinculo' => null,
            'descripcion_estado' => 'Pendiente de validación.',
            'datos_faltantes' => null,
        ];

        $idEdicionInterno = $this->idEdicionInterno($nEdicion);
        if (!$idEdicionInterno) {
            return array_merge($base, [
                'descripcion_estado' => 'Edición no encontrada.',
                'datos_faltantes' => "n_edicion {$nEdicion} sin registro en ediciones.",
            ]);
        }

        if (!$nombreEstudiante || !trim($nombreEstudiante)) {
            return array_merge($base, [
                'descripcion_estado' => 'Fila sin nombre de estudiante.',
                'datos_faltantes' => 'Student Name vacío en el Excel.',
            ]);
        }

        if (!$base['correo_profesor']) {
            return array_merge($base, [
                'descripcion_estado' => 'Fila sin Teacher Email.',
                'datos_faltantes' => 'Teacher Email vacío en el Excel.',
            ]);
        }

        $profesorData = $this->resolverProfesorPorCorreo($base['correo_profesor']);
        if (!$profesorData) {
            return array_merge($base, [
                'descripcion_estado' => 'Profesor no encontrado por Teacher Email.',
                'datos_faltantes' => 'No existe profesor con correo ' . $base['correo_profesor'],
            ]);
        }

        $base['id_profesor'] = $profesorData['id_profesor'];
        $base['nombre_profesor'] = $profesorData['nombre_profesor'];

        $estudiantesProfesor = $this->estudiantesDelProfesorEnEdicion(
            $profesorData['id_profesor'],
            $idEdicionInterno,
        );

        if ($estudiantesProfesor->isEmpty()) {
            return array_merge($base, [
                'descripcion_estado' => 'El profesor no tiene estudiantes preinscritos en esta edición.',
                'datos_faltantes' => 'Sin filas en profesor_estudiante para ' . $base['correo_profesor'],
            ]);
        }

        $match = $this->buscarEstudianteEnLista(
            trim($nombreEstudiante),
            $studentUsername,
            $estudiantesProfesor,
        );

        if (!$match) {
            return array_merge($base, [
                'descripcion_estado' => 'Estudiante no vinculado a este Teacher Email en la edición.',
                'datos_faltantes' => sprintf(
                    'Teacher Email: %s · Student Name: %s — no coincide con preinscripción.',
                    $base['correo_profesor'],
                    trim($nombreEstudiante),
                ),
            ]);
        }

        $base['id_estudiante'] = (int) $match['estudiante']->id;
        $base['metodo_vinculo'] = $match['metodo'];

        $idEscuela = $this->resolverEscuela(
            $profesorData['id_profesor'],
            $idEdicionInterno,
            $base['id_estudiante'],
            $escuelaExcel,
        );

        if (!$idEscuela) {
            return array_merge($base, [
                'descripcion_estado' => 'Estudiante encontrado pero el profesor no tiene escuela en la edición.',
                'datos_faltantes' => 'Falta registro en profesor_escuela.',
            ]);
        }

        $base['id_escuela'] = $idEscuela;

        if ($escuelaExcel) {
            $inconsistencia = $this->validarEscuelaExcel($idEscuela, $escuelaExcel);
            if ($inconsistencia) {
                return array_merge($base, $inconsistencia);
            }
        }

        return array_merge($base, [
            'descripcion_estado' => sprintf(
                'Vinculado por Teacher Email + %s.',
                $match['metodo'] === 'nro_ci' ? 'Student Username (CI)' : 'Student Name',
            ),
            'datos_faltantes' => null,
        ]);
    }

    /**
     * Clasificación completa para importación (incluye estado_validacion).
     */
    public function validarParaImportacion(
        int $nEdicion,
        ?string $correoProfesor,
        ?string $nombreEstudiante,
        ?string $studentUsername = null,
        ?string $escuelaExcel = null,
    ): array {
        $vinculo = $this->resolver($nEdicion, $correoProfesor, $nombreEstudiante, $studentUsername, $escuelaExcel);

        $estado = 'pendiente_no_preinscrito';
        if ($vinculo['id_estudiante'] && $vinculo['id_escuela']) {
            $estado = str_contains($vinculo['descripcion_estado'] ?? '', 'no coincide')
                || str_contains($vinculo['datos_faltantes'] ?? '', 'Excel:')
                ? 'inconsistencia'
                : 'preinscrito';
        } elseif (str_contains($vinculo['descripcion_estado'] ?? '', 'escuela del Excel')) {
            $estado = 'inconsistencia';
        } elseif ($vinculo['id_estudiante'] && !$vinculo['id_escuela']) {
            $estado = 'inconsistencia';
        }

        if ($estado === 'preinscrito') {
            $vinculo['descripcion_estado'] =
                'Coincide con preinscripción (Teacher Email + estudiante + escuela + edición).';
        }

        return array_merge($vinculo, ['estado_validacion' => $estado]);
    }

    /**
     * @return array{
     *   vinculado: bool,
     *   cambios: array<string, mixed>,
     *   preinscripcion_creada?: bool,
     *   estudiante_creado?: bool,
     *   motivo?: string
     * }
     */
    public function repararRegistro(ResultadoPendiente $resultado, bool $autoDesdeExcel = false): array
    {
        if ($resultado->id_estudiante && $resultado->id_escuela && $resultado->id_profesor) {
            return ['vinculado' => true, 'cambios' => []];
        }

        $nEdicion = (int) $resultado->edicion;
        $vinculo = $this->resolver(
            $nEdicion,
            $resultado->correo_profesor,
            $resultado->nombre_estudiante,
            $resultado->student_username,
            $resultado->escuela_excel,
        );

        $preinscripcionCreada = false;
        $estudianteCreado = false;
        $motivo = $vinculo['datos_faltantes'] ?? $vinculo['descripcion_estado'] ?? '';

        if ($autoDesdeExcel && (!$vinculo['id_estudiante'] || !$vinculo['id_escuela'])) {
            $auto = $this->autoVincularRegistro($resultado, $vinculo);
            $vinculo = array_merge($vinculo, $auto['vinculo']);
            $preinscripcionCreada = $auto['preinscripcion_creada'];
            $estudianteCreado = $auto['estudiante_creado'];
            $motivo = $auto['motivo'] ?? $motivo;
        }

        $cambios = [];
        foreach (['id_profesor', 'nombre_profesor', 'id_estudiante', 'id_escuela'] as $campo) {
            if (empty($resultado->{$campo}) && !empty($vinculo[$campo])) {
                $cambios[$campo] = $vinculo[$campo];
            }
        }

        if ($vinculo['id_estudiante'] && $vinculo['id_escuela']) {
            $cambios['descripcion_estado'] = $vinculo['descripcion_estado'] ?? 'Vinculado desde Excel (Teacher Email + Student Name).';
            $cambios['datos_faltantes'] = null;
        } elseif (!empty($vinculo['datos_faltantes'])) {
            $cambios['datos_faltantes'] = $vinculo['datos_faltantes'];
            $cambios['descripcion_estado'] = $vinculo['descripcion_estado'];
        }

        if (!empty($cambios)) {
            $resultado->update($cambios);
        }

        $resultado->refresh();

        $vinculado = (bool) ($resultado->id_estudiante && $resultado->id_escuela);

        return [
            'vinculado' => $vinculado,
            'cambios' => $cambios,
            'preinscripcion_creada' => $preinscripcionCreada,
            'estudiante_creado' => $estudianteCreado,
            'motivo' => $vinculado ? null : $motivo,
        ];
    }

    /**
     * Crea preinscripción / estudiante cuando no existe profesor_estudiante en la edición.
     *
     * @return array{
     *   vinculo: array<string, mixed>,
     *   preinscripcion_creada: bool,
     *   estudiante_creado: bool,
     *   motivo: ?string
     * }
     */
    private function autoVincularRegistro(ResultadoPendiente $resultado, array $vinculoParcial): array
    {
        $nEdicion = (int) $resultado->edicion;
        $idEdicionInterno = $this->idEdicionInterno($nEdicion);
        $motivo = null;
        $preinscripcionCreada = false;
        $estudianteCreado = false;

        if (!$idEdicionInterno) {
            return [
                'vinculo' => $vinculoParcial,
                'preinscripcion_creada' => false,
                'estudiante_creado' => false,
                'motivo' => 'Edición no encontrada.',
            ];
        }

        $correo = $vinculoParcial['correo_profesor'] ?? $this->normalizarCorreo($resultado->correo_profesor ?? '');
        $profesorData = $vinculoParcial['id_profesor']
            ? ['id_profesor' => $vinculoParcial['id_profesor'], 'nombre_profesor' => $vinculoParcial['nombre_profesor']]
            : $this->resolverProfesorPorCorreo($correo);

        if (!$profesorData) {
            return [
                'vinculo' => $vinculoParcial,
                'preinscripcion_creada' => false,
                'estudiante_creado' => false,
                'motivo' => 'Profesor no encontrado: ' . $correo,
            ];
        }

        $vinculoParcial['id_profesor'] = $profesorData['id_profesor'];
        $vinculoParcial['nombre_profesor'] = $profesorData['nombre_profesor'];
        $vinculoParcial['correo_profesor'] = $correo;

        $idEscuela = $vinculoParcial['id_escuela'] ?? $this->resolverEscuelaProfesor(
            $profesorData['id_profesor'],
            $idEdicionInterno,
            $resultado->escuela_excel,
        );

        if (!$idEscuela) {
            return [
                'vinculo' => $vinculoParcial,
                'preinscripcion_creada' => false,
                'estudiante_creado' => false,
                'motivo' => 'No se pudo determinar escuela para ' . $correo,
            ];
        }

        $vinculoParcial['id_escuela'] = $idEscuela;

        $idEstudiante = $vinculoParcial['id_estudiante'] ?? null;
        $metodo = $vinculoParcial['metodo_vinculo'] ?? null;

        if (!$idEstudiante) {
            // Buscar entre estudiantes del profesor en cualquier edición
            $historicos = $this->estudiantesDelProfesorCualquierEdicion($profesorData['id_profesor']);
            $match = $this->buscarEstudianteEnLista(
                trim($resultado->nombre_estudiante),
                $resultado->student_username,
                $historicos,
            );

            if ($match) {
                $idEstudiante = (int) $match['estudiante']->id;
                $metodo = 'historico_' . $match['metodo'];
            } else {
                // Crear estudiante nuevo desde Excel
                $estudiante = Estudiante::create([
                    'nro_ci' => $this->normalizarCi($resultado->student_username),
                    'nombre' => mb_substr(trim($resultado->nombre_estudiante), 0, 80),
                    'sexo' => $this->normalizarSexo($resultado->sexo),
                    'editado' => false,
                    'inscrito' => true,
                ]);
                $idEstudiante = $estudiante->id;
                $estudianteCreado = true;
                $metodo = 'creado_desde_excel';
            }
        }

        $vinculoParcial['id_estudiante'] = $idEstudiante;
        $vinculoParcial['metodo_vinculo'] = $metodo;

        if ($this->asegurarProfesorEstudiante($profesorData['id_profesor'], $idEstudiante, $idEdicionInterno)) {
            $preinscripcionCreada = true;
        }

        $this->asegurarEstudianteEscuela(
            $idEstudiante,
            $idEscuela,
            $idEdicionInterno,
            (int) ($resultado->id_categoria ?? 7),
            $resultado->grado,
        );

        $vinculoParcial['descripcion_estado'] = sprintf(
            'Auto-vinculado (Teacher Email + %s). Preinscripción %s.',
            $metodo ?? 'Student Name',
            $preinscripcionCreada ? 'creada' : 'existente',
        );
        $vinculoParcial['datos_faltantes'] = null;

        return [
            'vinculo' => $vinculoParcial,
            'preinscripcion_creada' => $preinscripcionCreada,
            'estudiante_creado' => $estudianteCreado,
            'motivo' => null,
        ];
    }

    private function asegurarProfesorEstudiante(int $idProfesor, int $idEstudiante, int $idEdicionInterno): bool
    {
        $existe = DB::table('profesor_estudiante')
            ->where('id_profesor', $idProfesor)
            ->where('id_estudiante', $idEstudiante)
            ->where('edicion', $idEdicionInterno)
            ->whereNull('deleted_at')
            ->exists();

        if ($existe) {
            return false;
        }

        ProfesorEstudiante::create([
            'id_profesor' => $idProfesor,
            'id_estudiante' => $idEstudiante,
            'edicion' => $idEdicionInterno,
        ]);

        return true;
    }

    private function asegurarEstudianteEscuela(
        int $idEstudiante,
        int $idEscuela,
        int $idEdicionInterno,
        int $idCategoria,
        ?int $grado,
    ): void {
        $existe = DB::table('estudiante_escuela')
            ->where('id_estudiante', $idEstudiante)
            ->where('edicion', $idEdicionInterno)
            ->exists();

        if ($existe) {
            return;
        }

        DB::table('estudiante_escuela')->insert([
            'id_estudiante' => $idEstudiante,
            'id_escuela' => $idEscuela,
            'id_categoria' => $idCategoria,
            'edicion' => $idEdicionInterno,
            'grado' => $grado,
            'puntuacion' => null,
            'medalla' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function resolverEscuelaProfesor(int $idProfesor, int $idEdicionInterno, ?string $escuelaExcel): ?int
    {
        $id = DB::table('profesor_escuela')
            ->where('id_profesor', $idProfesor)
            ->where('edicion', $idEdicionInterno)
            ->whereNull('deleted_at')
            ->value('id_escuela');

        if ($id) {
            return (int) $id;
        }

        $id = DB::table('profesor_escuela')
            ->where('id_profesor', $idProfesor)
            ->whereNull('deleted_at')
            ->orderByDesc('edicion')
            ->value('id_escuela');

        if ($id) {
            return (int) $id;
        }

        return $this->buscarEscuelaPorNombre($escuelaExcel);
    }

    private function buscarEscuelaPorNombre(?string $nombre): ?int
    {
        if (!$nombre || !trim($nombre)) {
            return null;
        }

        $norm = $this->normalizarTexto($nombre);
        $escuelas = DB::table('escuelas')->select('id', 'nombre')->get();

        foreach ($escuelas as $esc) {
            $escNorm = $this->normalizarTexto($esc->nombre);
            if ($escNorm === $norm || str_contains($escNorm, $norm) || str_contains($norm, $escNorm)) {
                return (int) $esc->id;
            }
        }

        return null;
    }

    private function estudiantesDelProfesorCualquierEdicion(int $idProfesor): Collection
    {
        return DB::table('profesor_estudiante as pe')
            ->join('estudiantes as e', 'e.id', '=', 'pe.id_estudiante')
            ->where('pe.id_profesor', $idProfesor)
            ->whereNull('pe.deleted_at')
            ->select('e.id', 'e.nombre', 'e.nro_ci')
            ->distinct()
            ->get();
    }

    private function normalizarCi(?string $username): ?string
    {
        if (!$username) {
            return null;
        }
        $ci = preg_replace('/\D/', '', trim($username));

        return ($ci && strlen($ci) === 11) ? $ci : null;
    }

    private function normalizarSexo(?string $sexo): string
    {
        $s = mb_strtolower(trim($sexo ?? ''), 'UTF-8');
        if (in_array($s, ['f', 'female', 'femenino', 'femenina'], true)) {
            return 'Femenino';
        }
        if (in_array($s, ['m', 'male', 'masculino'], true)) {
            return 'Masculino';
        }

        return 'Masculino';
    }

    /**
     * Repara vínculos en lote para una edición.
     *
     * @return array{reparados: int, sin_vinculo: int, total: int}
     */
    public function repararEdicion(int $nEdicion, ?string $soloEstado = null, bool $autoDesdeExcel = false): array
    {
        $query = ResultadoPendiente::where('edicion', $nEdicion)
            ->where(function ($q) {
                $q->whereNull('id_estudiante')
                    ->orWhereNull('id_escuela')
                    ->orWhereNull('id_profesor');
            });

        if ($soloEstado) {
            $query->where('estado_validacion', $soloEstado);
        }

        $registros = $query->get();
        $reparados = 0;
        $sinVinculo = 0;

        foreach ($registros as $registro) {
            $res = $this->repararRegistro($registro, $autoDesdeExcel);
            if ($res['vinculado']) {
                $reparados++;
            } else {
                $sinVinculo++;
            }
        }

        return [
            'total' => $registros->count(),
            'reparados' => $reparados,
            'sin_vinculo' => $sinVinculo,
        ];
    }

    /**
     * Auto-vincula desde Excel: crea profesor_estudiante / estudiante si hace falta.
     *
     * @return array{
     *   total: int,
     *   vinculados: int,
     *   preinscripciones_creadas: int,
     *   estudiantes_creados: int,
     *   sin_profesor: int,
     *   sin_escuela: int,
     *   sin_vinculo: int
     * }
     */
    public function autoVincularDesdeExcel(int $nEdicion, ?string $soloEstado = null): array
    {
        $query = ResultadoPendiente::where('edicion', $nEdicion)
            ->where(function ($q) {
                $q->whereNull('id_estudiante')->orWhereNull('id_escuela')->orWhereNull('id_profesor');
            });

        if ($soloEstado) {
            $query->where('estado_validacion', $soloEstado);
        }

        $registros = $query->get();
        $stats = [
            'total' => $registros->count(),
            'vinculados' => 0,
            'preinscripciones_creadas' => 0,
            'estudiantes_creados' => 0,
            'sin_profesor' => 0,
            'sin_escuela' => 0,
            'sin_vinculo' => 0,
        ];

        foreach ($registros as $registro) {
            $res = $this->repararRegistro($registro, true);
            if ($res['vinculado']) {
                $stats['vinculados']++;
                if (!empty($res['preinscripcion_creada'])) {
                    $stats['preinscripciones_creadas']++;
                }
                if (!empty($res['estudiante_creado'])) {
                    $stats['estudiantes_creados']++;
                }
            } elseif (str_contains($res['motivo'] ?? '', 'Profesor no encontrado')) {
                $stats['sin_profesor']++;
            } elseif (str_contains($res['motivo'] ?? '', 'escuela')) {
                $stats['sin_escuela']++;
            } else {
                $stats['sin_vinculo']++;
            }
        }

        return $stats;
    }

    private function resolverProfesorPorCorreo(string $correo): ?array
    {
        $correo = $this->normalizarCorreo($correo);
        $usuario = User::whereRaw('LOWER(correo) = ?', [$correo])->first();
        if (!$usuario) {
            return null;
        }

        $profesor = Profesor::where('user_id', $usuario->id)->first();
        if (!$profesor) {
            return null;
        }

        return [
            'id_profesor' => $profesor->id,
            'nombre_profesor' => trim($usuario->nombre . ' ' . $usuario->apellidos),
        ];
    }

    private function estudiantesDelProfesorEnEdicion(int $idProfesor, int $idEdicionInterno): Collection
    {
        return DB::table('profesor_estudiante as pe')
            ->join('estudiantes as e', 'e.id', '=', 'pe.id_estudiante')
            ->where('pe.id_profesor', $idProfesor)
            ->where('pe.edicion', $idEdicionInterno)
            ->whereNull('pe.deleted_at')
            ->select('e.id', 'e.nombre', 'e.nro_ci')
            ->get();
    }

    /**
     * @return array{estudiante: object, metodo: string}|null
     */
    private function buscarEstudianteEnLista(
        string $nombreExcel,
        ?string $studentUsername,
        Collection $estudiantesProfesor,
    ): ?array {
        $nombreNorm = $this->normalizarTexto($nombreExcel);

        // 1) Student Username = nro_ci del estudiante preinscrito por este profesor
        if ($studentUsername && trim($studentUsername) !== '') {
            $ci = trim($studentUsername);
            $porCi = $estudiantesProfesor->first(fn ($e) => $e->nro_ci && trim($e->nro_ci) === $ci);
            if ($porCi) {
                return ['estudiante' => $porCi, 'metodo' => 'nro_ci'];
            }
        }

        // 2) Coincidencia exacta normalizada
        foreach ($estudiantesProfesor as $est) {
            if ($this->normalizarTexto($est->nombre) === $nombreNorm) {
                return ['estudiante' => $est, 'metodo' => 'nombre_exacto'];
            }
        }

        // 3) Orden invertido (Apellidos Nombre vs Nombre Apellidos)
        $partes = preg_split('/\s+/', $nombreNorm, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if (count($partes) >= 2) {
            $invertido = implode(' ', array_reverse($partes));
            foreach ($estudiantesProfesor as $est) {
                $estNorm = $this->normalizarTexto($est->nombre);
                if ($estNorm === $invertido) {
                    return ['estudiante' => $est, 'metodo' => 'nombre_invertido'];
                }
            }
        }

        // 4) Contiene / está contenido (nombres parciales)
        foreach ($estudiantesProfesor as $est) {
            $estNorm = $this->normalizarTexto($est->nombre);
            if (str_contains($estNorm, $nombreNorm) || str_contains($nombreNorm, $estNorm)) {
                if (strlen($nombreNorm) >= 5 && strlen($estNorm) >= 5) {
                    return ['estudiante' => $est, 'metodo' => 'nombre_parcial'];
                }
            }
        }

        // 5) Similitud difusa — solo entre estudiantes de ESTE profesor
        $mejor = null;
        $mejorPct = 0.0;
        foreach ($estudiantesProfesor as $est) {
            similar_text($nombreNorm, $this->normalizarTexto($est->nombre), $pct);
            if ($pct > $mejorPct) {
                $mejorPct = $pct;
                $mejor = $est;
            }
        }

        if ($mejor && $mejorPct >= self::UMBRAL_SIMILITUD) {
            return ['estudiante' => $mejor, 'metodo' => 'similitud_' . round($mejorPct) . 'pct'];
        }

        return null;
    }

    private function resolverEscuela(
        int $idProfesor,
        int $idEdicionInterno,
        int $idEstudiante,
        ?string $escuelaExcel,
    ): ?int {
        $profesorEscuela = DB::table('profesor_escuela')
            ->where('id_profesor', $idProfesor)
            ->where('edicion', $idEdicionInterno)
            ->whereNull('deleted_at')
            ->value('id_escuela');

        if ($profesorEscuela) {
            return (int) $profesorEscuela;
        }

        $estEscuela = DB::table('estudiante_escuela')
            ->where('id_estudiante', $idEstudiante)
            ->where('edicion', $idEdicionInterno)
            ->value('id_escuela');

        if ($estEscuela) {
            return (int) $estEscuela;
        }

        if ($escuelaExcel && trim($escuelaExcel) !== '') {
            $norm = $this->normalizarTexto($escuelaExcel);
            $escuela = DB::table('escuelas')
                ->whereRaw('LOWER(REPLACE(REPLACE(nombre, \'á\', \'a\'), \'é\', \'e\')) LIKE ?', ['%' . substr($norm, 0, 20) . '%'])
                ->value('id');

            return $escuela ? (int) $escuela : null;
        }

        return null;
    }

    /**
     * @return array<string, string>|null inconsistencia
     */
    private function validarEscuelaExcel(int $idEscuela, string $escuelaExcel): ?array
    {
        $nombreEscuelaBd = DB::table('escuelas')->where('id', $idEscuela)->value('nombre');
        if (!$nombreEscuelaBd) {
            return null;
        }

        $excelNorm = $this->normalizarTexto($escuelaExcel);
        $bdNorm = $this->normalizarTexto($nombreEscuelaBd);

        if ($excelNorm !== $bdNorm && !str_contains($excelNorm, $bdNorm) && !str_contains($bdNorm, $excelNorm)) {
            return [
                'descripcion_estado' => 'La escuela del Excel no coincide con la escuela del profesor.',
                'datos_faltantes' => "Excel: {$escuelaExcel} · Sistema: {$nombreEscuelaBd}",
            ];
        }

        return null;
    }

    private function normalizarCorreo(string $correo): string
    {
        return strtolower(trim($correo));
    }

    public function normalizarTexto(string $texto): string
    {
        $texto = trim($texto);
        $texto = mb_strtolower($texto, 'UTF-8');
        $texto = preg_replace('/[,.\-_\(\)\[\]\'"]+/', ' ', $texto) ?? $texto;
        $texto = preg_replace('/\s+/', ' ', $texto) ?? $texto;

        $buscar = ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', 'à', 'è', 'ì', 'ò', 'ù'];
        $reemplazar = ['a', 'e', 'i', 'o', 'u', 'u', 'n', 'a', 'e', 'i', 'o', 'u'];

        return trim(str_replace($buscar, $reemplazar, $texto));
    }
}
