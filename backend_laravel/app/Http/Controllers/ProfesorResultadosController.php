<?php

namespace App\Http\Controllers;

use App\Http\Concerns\ResuelveEdicionResultados;
use App\Models\Profesor;
use App\Models\ResultadoPendiente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfesorResultadosController extends Controller
{
    use ResuelveEdicionResultados;

    private array $estadosPendientesProfesor = [
        'pendiente_no_preinscrito',
        'inconsistencia',
        'modificado_profesor',
    ];

    public function pendientes(int $edicion, int $idProfesor)
    {
        $profesor = $this->profesorDelRequest(request(), $idProfesor);

        $data = ResultadoPendiente::with('categoria')
            ->where('edicion', $edicion)
            ->where('id_profesor', $profesor->id)
            ->whereIn('estado_validacion', $this->estadosPendientesProfesor)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $data, 'total' => $data->count()]);
    }

    public function detallePendiente(int $idProfesor, int $id)
    {
        $profesor = $this->profesorDelRequest(request(), $idProfesor);

        $resultado = ResultadoPendiente::with(['categoria', 'escuela', 'estudiante'])
            ->where('id', $id)
            ->where('id_profesor', $profesor->id)
            ->whereIn('estado_validacion', $this->estadosPendientesProfesor)
            ->first();

        if (!$resultado) {
            return response()->json([
                'success' => false,
                'message' => 'Pendiente no disponible para este profesor.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resultado,
            'descripcion_estado' => $resultado->descripcion_estado ?? $resultado->datos_faltantes,
        ]);
    }

    public function modificarPendiente(Request $request, int $id)
    {
        $user = $request->user();
        $profesor = Profesor::where('user_id', $user->id)->firstOrFail();

        $resultado = ResultadoPendiente::where('id', $id)
            ->where('id_profesor', $profesor->id)
            ->whereIn('estado_validacion', ['pendiente_no_preinscrito', 'inconsistencia', 'modificado_profesor'])
            ->firstOrFail();

        $request->validate([
            'nombre_estudiante' => 'nullable|string|max:255',
            'escuela_excel' => 'nullable|string|max:255',
            'grado' => 'nullable|integer',
            'sexo' => 'nullable|string|max:20',
            'observaciones' => 'nullable|string',
        ]);

        $resultado->update([
            'nombre_estudiante' => $request->input('nombre_estudiante', $resultado->nombre_estudiante),
            'escuela_excel' => $request->input('escuela_excel', $resultado->escuela_excel),
            'grado' => $request->input('grado', $resultado->grado),
            'sexo' => $request->input('sexo', $resultado->sexo),
            'observaciones' => $request->input('observaciones', $resultado->observaciones),
            'estado_validacion' => 'modificado_profesor',
            'estado' => 'modificado_profesor',
            'requiere_aprobacion' => true,
            'editado_por_profesor' => true,
            'aprobado_por_coordinador' => false,
            'descripcion_estado' => 'Modificado por el profesor. Pendiente de aprobación del Coordinador.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendiente actualizado. El Coordinador debe revisarlo.',
            'data' => $resultado->fresh(['categoria']),
        ]);
    }

    public function oficiales(int $edicion, int $idProfesor)
    {
        $profesor = $this->profesorDelRequest(request(), $idProfesor);
        $idEdicion = $this->idEdicionInterno($edicion);

        if (!$idEdicion) {
            return response()->json(['success' => false, 'message' => 'Edición no encontrada.'], 404);
        }

        $data = DB::table('estudiante_escuela as ee')
            ->join('estudiantes as e', 'e.id', '=', 'ee.id_estudiante')
            ->join('profesor_estudiante as pe', function ($join) use ($profesor, $idEdicion) {
                $join->on('pe.id_estudiante', '=', 'e.id')
                    ->where('pe.id_profesor', $profesor->id)
                    ->where('pe.edicion', $idEdicion);
            })
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

    public function oficialesResumen(int $edicion, int $idProfesor)
    {
        $profesor = $this->profesorDelRequest(request(), $idProfesor);
        $idEdicion = $this->idEdicionInterno($edicion);

        if (!$idEdicion) {
            return response()->json(['success' => false, 'message' => 'Edición no encontrada.'], 404);
        }

        $rows = DB::table('estudiante_escuela as ee')
            ->join('estudiantes as e', 'e.id', '=', 'ee.id_estudiante')
            ->join('profesor_estudiante as pe', function ($join) use ($profesor, $idEdicion) {
                $join->on('pe.id_estudiante', '=', 'e.id')
                    ->where('pe.id_profesor', $profesor->id)
                    ->where('pe.edicion', $idEdicion);
            })
            ->join('categorias as c', 'c.id', '=', 'ee.id_categoria')
            ->where('ee.edicion', $idEdicion)
            ->where(function ($q) {
                $q->whereNotNull('ee.puntuacion')->orWhereNotNull('ee.medalla');
            })
            ->select('ee.medalla', 'c.nombre_cuba as categoria')
            ->get();

        $porMedalla = $rows->groupBy(fn ($r) => $r->medalla ?? 'Participa')->map->count();
        $porCategoria = $rows->groupBy('categoria')->map->count();

        return response()->json([
            'success' => true,
            'edicion' => $edicion,
            'total' => $rows->count(),
            'por_medalla' => $porMedalla,
            'por_categoria' => $porCategoria,
        ]);
    }

    public function detalleOficial(int $idProfesor, int $id)
    {
        $profesor = $this->profesorDelRequest(request(), $idProfesor);

        $detalle = DB::table('estudiante_escuela as ee')
            ->join('estudiantes as e', 'e.id', '=', 'ee.id_estudiante')
            ->join('profesor_estudiante as pe', function ($join) use ($profesor) {
                $join->on('pe.id_estudiante', '=', 'e.id')
                    ->where('pe.id_profesor', $profesor->id);
            })
            ->join('categorias as c', 'c.id', '=', 'ee.id_categoria')
            ->leftJoin('escuelas as esc', 'esc.id', '=', 'ee.id_escuela')
            ->where('ee.id', $id)
            ->where(function ($q) {
                $q->whereNotNull('ee.puntuacion')->orWhereNotNull('ee.medalla');
            })
            ->select(
                'ee.id',
                'ee.edicion',
                'e.nombre as nombre_estudiante',
                'e.nro_ci',
                'esc.nombre as nombre_escuela',
                'c.nombre_cuba as categoria',
                'ee.puntuacion',
                'ee.medalla',
                'ee.grado'
            )
            ->first();

        if (!$detalle) {
            return response()->json(['success' => false, 'message' => 'Resultado oficial no encontrado.'], 404);
        }

        return response()->json(['success' => true, 'data' => $detalle]);
    }
}
