<?php

namespace App\Http\Controllers;

use App\Http\Concerns\ResuelveEdicionResultados;
use App\Models\ResultadoPendiente;
use App\Services\VinculoResultadoPendienteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CoordinadorResultadosController extends Controller
{
    use ResuelveEdicionResultados;

    public function __construct(
        private readonly VinculoResultadoPendienteService $vinculoService,
    ) {}

    public function revisionResumen(int $edicion)
    {
        $base = ResultadoPendiente::where('edicion', $edicion);

        $porEstado = (clone $base)
            ->select('estado_validacion', DB::raw('COUNT(*) as total'))
            ->groupBy('estado_validacion')
            ->pluck('total', 'estado_validacion');

        $porCategoria = (clone $base)
            ->join('categorias', 'categorias.id', '=', 'resultados_pendientes.id_categoria')
            ->select('categorias.nombre_cuba as categoria', DB::raw('COUNT(*) as total'))
            ->groupBy('categorias.nombre_cuba')
            ->pluck('total', 'categoria');

        $porProfesor = (clone $base)
            ->select('correo_profesor', DB::raw('COUNT(*) as total'))
            ->whereNotNull('correo_profesor')
            ->groupBy('correo_profesor')
            ->orderByDesc('total')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'edicion' => $edicion,
            'total' => (clone $base)->count(),
            'por_estado' => $porEstado,
            'por_categoria' => $porCategoria,
            'por_profesor' => $porProfesor,
        ]);
    }

    public function todos(int $edicion)
    {
        return $this->listar($edicion);
    }

    public function preinscritos(int $edicion)
    {
        return $this->listar($edicion, 'preinscrito');
    }

    public function pendientes(int $edicion)
    {
        return $this->listar($edicion, 'pendiente_no_preinscrito');
    }

    public function inconsistencias(int $edicion)
    {
        return $this->listar($edicion, 'inconsistencia');
    }

    public function modificadosProfesor(int $edicion)
    {
        return $this->listar($edicion, 'modificado_profesor');
    }

    public function aceptados(int $edicion)
    {
        return $this->listar($edicion, 'aceptado_coordinador');
    }

    public function insertadosHistorico(int $edicion)
    {
        return $this->listar($edicion, 'insertado_historico');
    }

    public function pendientesIntegracion(int $edicion)
    {
        $data = $this->queryEdicion($edicion)
            ->where('estado_validacion', 'aceptado_coordinador')
            ->where(function ($q) {
                $q->whereNull('id_estudiante')->orWhereNull('id_escuela');
            })
            ->get();

        return response()->json(['success' => true, 'data' => $data, 'total' => $data->count()]);
    }

    public function oficiales(int $edicion)
    {
        $idEdicion = $this->idEdicionInterno($edicion);
        if (!$idEdicion) {
            return response()->json(['success' => false, 'message' => 'Edición no encontrada.'], 404);
        }

        $data = DB::table('estudiante_escuela as ee')
            ->join('estudiantes as e', 'e.id', '=', 'ee.id_estudiante')
            ->join('categorias as c', 'c.id', '=', 'ee.id_categoria')
            ->leftJoin('escuelas as esc', 'esc.id', '=', 'ee.id_escuela')
            ->where('ee.edicion', $idEdicion)
            ->where(function ($q) {
                $q->whereNotNull('ee.puntuacion')->orWhereNotNull('ee.medalla');
            })
            ->select(
                'ee.id',
                'e.nombre as nombre_estudiante',
                'esc.nombre as nombre_escuela',
                'c.nombre_cuba as categoria',
                'ee.puntuacion',
                'ee.medalla',
                'ee.grado'
            )
            ->orderByDesc('ee.puntuacion')
            ->get();

        return response()->json(['success' => true, 'data' => $data, 'total' => $data->count()]);
    }

    public function oficialesResumen(int $edicion)
    {
        $idEdicion = $this->idEdicionInterno($edicion);
        if (!$idEdicion) {
            return response()->json(['success' => false, 'message' => 'Edición no encontrada.'], 404);
        }

        $base = DB::table('estudiante_escuela as ee')
            ->where('ee.edicion', $idEdicion)
            ->where(function ($q) {
                $q->whereNotNull('ee.puntuacion')->orWhereNotNull('ee.medalla');
            });

        $porMedalla = (clone $base)
            ->select('ee.medalla', DB::raw('COUNT(*) as total'))
            ->groupBy('ee.medalla')
            ->pluck('total', 'medalla');

        $porCategoria = (clone $base)
            ->join('categorias as c', 'c.id', '=', 'ee.id_categoria')
            ->select('c.nombre_cuba as categoria', DB::raw('COUNT(*) as total'))
            ->groupBy('c.nombre_cuba')
            ->pluck('total', 'categoria');

        $porEscuela = (clone $base)
            ->join('escuelas as esc', 'esc.id', '=', 'ee.id_escuela')
            ->select('esc.nombre as escuela', DB::raw('COUNT(*) as total'))
            ->groupBy('esc.nombre')
            ->orderByDesc('total')
            ->limit(20)
            ->pluck('total', 'escuela');

        return response()->json([
            'success' => true,
            'edicion' => $edicion,
            'total' => (clone $base)->count(),
            'por_medalla' => $porMedalla,
            'por_categoria' => $porCategoria,
            'por_escuela' => $porEscuela,
        ]);
    }

    public function detalle(int $id)
    {
        $resultado = ResultadoPendiente::with(['categoria', 'profesor.user', 'estudiante', 'escuela'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $resultado,
            'descripcion_estado' => $resultado->descripcion_estado ?? $resultado->datos_faltantes,
        ]);
    }

    public function aceptar(int $id)
    {
        $resultado = ResultadoPendiente::findOrFail($id);
        $this->vinculoService->repararRegistro($resultado);
        $resultado->refresh();

        $resultado->update([
            'estado_validacion' => 'aceptado_coordinador',
            'estado' => 'aceptado_coordinador',
            'aprobado_por_coordinador' => true,
            'requiere_aprobacion' => false,
            'descripcion_estado' => 'Aceptado por el Coordinador Nacional.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resultado aceptado correctamente.',
            'data' => $resultado->fresh(['categoria']),
        ]);
    }

    public function aceptarPreinscritos(int $edicion)
    {
        $pendientes = ResultadoPendiente::where('edicion', $edicion)
            ->where('estado_validacion', 'preinscrito')
            ->get();

        foreach ($pendientes as $resultado) {
            $this->vinculoService->repararRegistro($resultado);
        }

        $actualizados = ResultadoPendiente::where('edicion', $edicion)
            ->where('estado_validacion', 'preinscrito')
            ->update([
                'estado_validacion' => 'aceptado_coordinador',
                'estado' => 'aceptado_coordinador',
                'aprobado_por_coordinador' => true,
                'requiere_aprobacion' => false,
                'descripcion_estado' => 'Aceptado masivamente (preinscritos).',
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => "Se aceptaron {$actualizados} resultado(s) preinscrito(s).",
            'total' => $actualizados,
        ]);
    }

    public function aceptarMasivo(Request $request)
    {
        $request->validate(['ids' => 'required|array|min:1', 'ids.*' => 'integer|exists:resultados_pendientes,id']);

        $registros = ResultadoPendiente::whereIn('id', $request->ids)->get();
        foreach ($registros as $resultado) {
            $this->vinculoService->repararRegistro($resultado);
        }

        $actualizados = ResultadoPendiente::whereIn('id', $request->ids)->update([
            'estado_validacion' => 'aceptado_coordinador',
            'estado' => 'aceptado_coordinador',
            'aprobado_por_coordinador' => true,
            'requiere_aprobacion' => false,
            'descripcion_estado' => 'Aceptado masivamente por el Coordinador.',
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Se aceptaron {$actualizados} resultado(s).",
            'total' => $actualizados,
        ]);
    }

    public function ajustarMedalla(Request $request, int $id)
    {
        $request->validate(['medalla' => 'required|string|in:' . implode(',', $this->medallasPermitidas())]);

        $resultado = ResultadoPendiente::findOrFail($id);
        $resultado->update(['medalla' => $request->medalla]);

        return response()->json([
            'success' => true,
            'message' => 'Medalla actualizada.',
            'data' => $resultado->fresh(['categoria']),
        ]);
    }

    public function repararVinculos(int $edicion)
    {
        $stats = $this->vinculoService->repararEdicion($edicion);

        $sinVinculo = ResultadoPendiente::where('edicion', $edicion)
            ->where('estado_validacion', 'aceptado_coordinador')
            ->where(function ($q) {
                $q->whereNull('id_estudiante')->orWhereNull('id_escuela');
            })
            ->count();

        return response()->json([
            'success' => true,
            'message' => "Reparación completada: {$stats['reparados']} vínculo(s) resueltos, {$stats['sin_vinculo']} sin coincidencia.",
            'reparados' => $stats['reparados'],
            'sin_vinculo' => $stats['sin_vinculo'],
            'total_procesados' => $stats['total'],
            'aceptados_sin_vinculo' => $sinVinculo,
        ]);
    }

    public function autoVincularDesdeExcel(int $edicion)
    {
        $stats = $this->vinculoService->autoVincularDesdeExcel($edicion);

        $listos = ResultadoPendiente::where('edicion', $edicion)
            ->whereNotNull('id_estudiante')
            ->whereNotNull('id_escuela')
            ->count();

        $aceptadosListos = ResultadoPendiente::where('edicion', $edicion)
            ->where('estado_validacion', 'aceptado_coordinador')
            ->whereNotNull('id_estudiante')
            ->whereNotNull('id_escuela')
            ->count();

        return response()->json([
            'success' => true,
            'message' => sprintf(
                'Auto-vinculación: %d vinculados, %d preinscripciones creadas, %d estudiantes nuevos, %d sin profesor, %d sin escuela, %d restantes.',
                $stats['vinculados'],
                $stats['preinscripciones_creadas'],
                $stats['estudiantes_creados'],
                $stats['sin_profesor'],
                $stats['sin_escuela'],
                $stats['sin_vinculo'],
            ),
            ...$stats,
            'listos_integracion' => $aceptadosListos,
            'total_con_vinculo' => $listos,
        ]);
    }

    public function insertarHistorico(int $edicion)
    {
        $idEdicion = $this->idEdicionInterno($edicion);
        if (!$idEdicion) {
            return response()->json(['success' => false, 'message' => 'Edición no encontrada.'], 404);
        }

        // Auto-vincular desde Excel antes de integrar (crea preinscripciones si faltan)
        $this->vinculoService->autoVincularDesdeExcel($edicion, 'aceptado_coordinador');

        $candidatos = ResultadoPendiente::where('edicion', $edicion)
            ->where('estado_validacion', 'aceptado_coordinador')
            ->get();

        $insertados = 0;
        $omitidos = 0;

        foreach ($candidatos as $resultado) {
            if (!$resultado->id_estudiante || !$resultado->id_escuela) {
                $omitidos++;
                continue;
            }

            $existente = DB::table('estudiante_escuela')
                ->where('edicion', $idEdicion)
                ->where('id_estudiante', $resultado->id_estudiante)
                ->first();

            $payload = [
                'puntuacion' => $resultado->puntuacion,
                'medalla' => $resultado->medalla,
                'id_categoria' => $resultado->id_categoria,
                'id_escuela' => $resultado->id_escuela,
                'grado' => $resultado->grado,
                'updated_at' => now(),
            ];

            if ($existente) {
                DB::table('estudiante_escuela')->where('id', $existente->id)->update($payload);
            } else {
                DB::table('estudiante_escuela')->insert(array_merge($payload, [
                    'edicion' => $idEdicion,
                    'id_estudiante' => $resultado->id_estudiante,
                    'created_at' => now(),
                ]));
            }

            $resultado->update([
                'estado_validacion' => 'insertado_historico',
                'estado' => 'insertado_historico',
                'descripcion_estado' => 'Insertado en el histórico oficial (estudiante_escuela).',
            ]);

            $insertados++;
        }

        return response()->json([
            'success' => true,
            'message' => "Integración completada: {$insertados} insertado(s), {$omitidos} omitido(s) por falta de vínculo.",
            'insertados' => $insertados,
            'omitidos' => $omitidos,
            'pendientes_integracion' => $omitidos,
        ]);
    }

    private function queryEdicion(int $edicion)
    {
        return ResultadoPendiente::with(['categoria', 'profesor', 'estudiante', 'escuela'])
            ->where('edicion', $edicion)
            ->orderByDesc('created_at');
    }

    private function listar(int $edicion, ?string $estadoValidacion = null)
    {
        $query = $this->queryEdicion($edicion);
        if ($estadoValidacion) {
            $query->where('estado_validacion', $estadoValidacion);
        }

        $data = $query->get();

        return response()->json(['success' => true, 'data' => $data, 'total' => $data->count()]);
    }
}
