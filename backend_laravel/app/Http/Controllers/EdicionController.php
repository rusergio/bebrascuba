<?php

namespace App\Http\Controllers;

use App\Models\Edicion;
use Illuminate\Http\Request;
use App\Models\Profesor;
use App\Models\Estudiante;
use App\Models\ResultadosProvincias;
use Illuminate\Support\Facades\DB;

class EdicionController extends Controller
{
    /**
     * inscrito = participa en el concurso de la edición abierta.
     * Registrado en BD ≠ inscrito hasta que el profesor preinscribe.
     */
    private function resetInscritosConcurso(): void
    {
        Estudiante::where('inscrito', true)->update(['inscrito' => false]);
    }

    /**
     * Resuelve la edición cuyos resultados provinciales se deben mostrar.
     * Si llega ?a_edicion=YYYY se usa esa edición (si existe y tiene datos).
     * Si no, se usa la última edición cerrada (comportamiento anterior).
     */
    private function resolverEdicionResultados(?string $aEdicionQuery): ?Edicion
    {
        if ($aEdicionQuery !== null && $aEdicionQuery !== '') {
            $y = (int) $aEdicionQuery;
            if ($y <= 0) {
                return null;
            }
            $edicion = Edicion::where('a_edicion', $y)->first();
            if (! $edicion) {
                return null;
            }
            $tieneDatos = ResultadosProvincias::where('id_edicion', $edicion->id)
                ->where('id_categoria', '!=', 7)
                ->exists();

            return $tieneDatos ? $edicion : null;
        }

        return $this->obtenerUltimaEdicionCerrada();
    }

    /**
     * Última edición cerrada (abierto = false), la de mayor n_edicion.
     */
    private function obtenerUltimaEdicionCerrada(): ?Edicion
    {
        return Edicion::where('abierto', false)
            ->orderBy('n_edicion', 'desc')
            ->first();
    }

    /**
     * Devuelve número y año de la última edición cerrada (público).
     */
    public function ultimaEdicionCerrada()
    {
        $edicion = $this->obtenerUltimaEdicionCerrada();

        if (! $edicion) {
            return response()->json(['n_edicion' => 0, 'a_edicion' => null], 200);
        }

        return response()->json([
            'n_edicion' => $edicion->n_edicion,
            'a_edicion' => (int) $edicion->a_edicion,
        ], 200);
    }

    /**
     * Siguiente número y año calendario sin saltar secuencia (ej. 3ª·2024 → 4ª·2025).
     */
    private function resolverSiguienteEdicion(): array
    {
        $ultima = Edicion::orderBy('n_edicion', 'desc')->first();

        if (!$ultima) {
            return ['n_edicion' => 1, 'a_edicion' => (int) date('Y')];
        }

        return [
            'n_edicion' => $ultima->n_edicion + 1,
            'a_edicion' => (int) $ultima->a_edicion + 1,
        ];
    }

    /**
     * Ediciones que tienen al menos un registro en resultados_provincias (público, para selector en inicio).
     * Incluye también la edición abierta aunque aún no tenga resultados publicados.
     */
    public function listarEdicionesConResultados()
    {
        $ids = ResultadosProvincias::query()
            ->whereNotNull('id_edicion')
            ->where('id_categoria', '!=', 7)
            ->distinct()
            ->pluck('id_edicion');

        $ediciones = Edicion::whereIn('id', $ids)
            ->orderBy('n_edicion', 'desc')
            ->orderBy('a_edicion', 'desc')
            ->get(['id', 'n_edicion', 'a_edicion', 'abierto']);

        $edicionAbierta = Edicion::where('abierto', true)->first();
        if ($edicionAbierta && !$ediciones->contains('id', $edicionAbierta->id)) {
            $ediciones->prepend($edicionAbierta);
        }

        $ediciones = $ediciones
            ->sortByDesc(fn ($e) => $e->n_edicion * 10000 + $e->a_edicion)
            ->values();

        return response()->json($ediciones, 200);
    }

    // Función para listar ediciones
    public function listarEdicionActual() {  
        //
        $edicionActual = Edicion::where('abierto', true)->first();
        // 
        if ($edicionActual) {
            return response() -> json($edicionActual, 200);
        }
        else {
            $data = [
                'message' => 'No hay edicion abierta',
                'status' => 404
            ];
            return response() -> json($data, 404);
        }
    }
    // Función para abrir la edición 
    public function abrirEdicion() {  
        // Verificar si ya hay una edición abierta  
        $edicionActual = Edicion::where('abierto', true)->first();  
        if ($edicionActual) {  
            return response()->json(['message' => 'Ya hay una edición abierta.'], 400);  
        }  
        // Obtener el número y año de la siguiente edición (sin saltar año ni número)
        $siguiente = $this->resolverSiguienteEdicion();
        $n_edicion = $siguiente['n_edicion'];
        $a_edicion = $siguiente['a_edicion'];
        // Crear la nueva edición  
        $nuevaEdicion = new Edicion([  
            'n_edicion' => $n_edicion,  
            'a_edicion' => $a_edicion,  
            'fecha_inic_inscrip' => now(),  
            'abierto' => true,  
        ]);  
        $nuevaEdicion->save();

        // Nueva edición: nadie está inscrito en concurso hasta preinscribir.
        $this->resetInscritosConcurso();

        $profesoresActivos = Profesor::where('esta_activo', false)->get();
        if ($profesoresActivos) {  
            $profesoresActivos->each(function ($profesor) {  
                $profesor->update([  
                    'esta_activo' => true,  
                ]);  
            });  
        } else {  
            return response()->json(['message' => 'No hay profesores activos para cerrar la edición.'], 200);  
        } 
    
        // Permitir que los usuarios (profesores) puedan iniciar sesión  
        // Aquí debes agregar la lógica para permitir el inicio de sesión de los profesores  
    
        return response()->json([
            'message' => 'Edición ' . $n_edicion . ' (' . $a_edicion . ') abierta exitosamente.',
            'n_edicion' => $n_edicion,
            'a_edicion' => $a_edicion,
        ], 200);  
    }
    // Función para cerrar la edición 
    public function cerrarEdicion() {  
        // Verificar primero si la edición está abierta o cerrada  
        $edicionActual = Edicion::where('abierto', true)->first();  
        if (!$edicionActual) {  
            return response()->json(['message' => 'No hay edición abierta para cerrar.'], 404);  
        }  
    
        // Obtener el número de la edición actual  
        $n_edicion = $edicionActual->n_edicion;
    
        // Actualizar la edición a cerrada  
        $edicionActual->update([  
            'abierto' => false,  
        ]);  
    
        // Actualizar el estado de los profesores a inactivos  
        $profesoresActivos = Profesor::where('esta_activo', true)->get();  
        if ($profesoresActivos->count() > 0) {  
            $profesoresActivos->each(function ($profesor) {  
                $profesor->update([  
                    'esta_activo' => false,  
                ]);  
            });  
        }  
    
        // Actualizar el estado de los profesores nuevos  
        // $profesoresNuevos = Profesor::where('es_nuevo', true)->get();  
        // if ($profesoresNuevos->count() > 0) {  
        //     $profesoresNuevos->each(function ($prof) {  
        //         $prof->update([  
        //             'es_nuevo' => false,  
        //         ]);  
        //     });  
        // }  
    
        // Al cerrar la edición, ningún estudiante queda inscrito en concurso.
        $this->resetInscritosConcurso();
    
        // Responder con el número de la edición cerrada
        return response()->json(['message' => 'Edición ' . $n_edicion . ' cerrada exitosamente.'], 200);  
    }
    // Función para verificar si la edición esta abierta o cerrada
    public function isEditionOpen() { 
        // Verificar si hay una edición abierta
        $edicionActual = Edicion::where('abierto', true)->first();
        // Devolver true si la edición está abierta, de lo contrario false
        if ($edicionActual) {
            return response()->json([
                'is_open' => true,
                'n_edicion' => $edicionActual->n_edicion,
                'a_edicion' => (int) $edicionActual->a_edicion,
            ], 200);
        } else {
            return response()->json(['is_open' => false], 200);
        }
    }
    // Edición vigente: abierta si existe; si no, la más reciente por número de edición.
    public function nroEdicion() {
        $edicion = Edicion::where('abierto', true)->first()
            ?? Edicion::orderBy('n_edicion', 'desc')->first();

        if (! $edicion) {
            return response()->json(['n_edicion' => 0, 'a_edicion' => null], 200);
        }

        return response()->json([
            'n_edicion' => $edicion->n_edicion,
            'a_edicion' => (int) $edicion->a_edicion,
        ], 200);
    }
    // Función para obtener el total de cantidad por provincia  
    public function totalCantidadPorProvincia(Request $request)
    {
        $edicion = $this->resolverEdicionResultados($request->query('a_edicion'));

        // Si no hay edición aplicable, retornar array vacío
        if (! $edicion) {
            return [];
        }

        // Obtener los resultados de la edición, excluyendo la categoría 7
        $resultados = ResultadosProvincias::where('id_edicion', $edicion->id)
            ->where('id_categoria', '!=', 7)
            ->get();

        // Calcular el total de cantidad por provincia
        $totalPorProvincia = [];
        foreach ($resultados as $resultado) {
            if (!isset($totalPorProvincia[$resultado->id_provincia])) {
                $totalPorProvincia[$resultado->id_provincia] = 0;
            }
            $totalPorProvincia[$resultado->id_provincia] += $resultado->cantidad;
        }
        return $totalPorProvincia;
    }
    // Función para listar los resultados provincial
    public function listarResultadosProvincias(Request $request)
    {
        $edicion = $this->resolverEdicionResultados($request->query('a_edicion'));

        // Si no hay edición aplicable, retornar arreglo vacío
        if (! $edicion) {
            return [];
        }

        // Obtener los resultados de la edición ordenados por id_provincia
        $resultados = ResultadosProvincias::with('provincia', 'categoria')
            ->where('id_edicion', $edicion->id)
            ->where('id_categoria', '!=', 7)    
            ->orderBy('id_provincia')  
            ->get();

        // Preparar los datos para retornar
        $data = [];
        foreach ($resultados as $resultado) {
            $provincia = $resultado->provincia;
            $categoria = $resultado->categoria;
            if (!isset($data[$provincia->nombre])) {
                $data[$provincia->nombre] = [
                    'provincia' => $provincia->nombre,
                    'superpegues' => 0,
                    'peque' => 0,
                    'benjamin' => 0,
                    'cadete' => 0,
                    'junior' => 0,
                    'senior' => 0,
                    'total' => 0
                ];
            }
            switch ($categoria->nombre_cuba) {
                case 'Superpegues':
                case 'SuperPeque':
                    // Algunas seeders usan 'SuperPeque' como nombre; mantener compatibilidad
                    $data[$provincia->nombre]['superpegues'] += $resultado->cantidad;
                    break;
                case 'Peque':
                    $data[$provincia->nombre]['peque'] += $resultado->cantidad;
                    break;
                case 'Benjamín':
                    $data[$provincia->nombre]['benjamin'] += $resultado->cantidad;
                    break;
                case 'Cadete':
                    $data[$provincia->nombre]['cadete'] += $resultado->cantidad;
                    break;
                case 'Junior':
                    $data[$provincia->nombre]['junior'] += $resultado->cantidad;
                    break;
                case 'Senior':
                    $data[$provincia->nombre]['senior'] += $resultado->cantidad;
                    break;
            }
            $data[$provincia->nombre]['total'] += $resultado->cantidad;
        }
        return array_values($data);
    }
    // Función para calcular el total por categoria
    public function totalCantidadPorCategoria(Request $request)
    {
        $edicion = $this->resolverEdicionResultados($request->query('a_edicion'));

        // Si no hay edición aplicable, retornar totales a cero
        $totalPorCategoria = [
            'superpegues' => 0,
            'peques' => 0,
            'benjamin' => 0,
            'cadete' => 0,
            'junior' => 0,
            'senior' => 0,
            'total' => 0
        ];

        if (! $edicion) {
            return $totalPorCategoria;
        }

        // Obtener los resultados de la edición, excluyendo los que tienen categoría 7
        $resultados = ResultadosProvincias::whereNotNull('id_categoria')
            ->where('id_categoria', '!=', 7)
            ->where('id_edicion', $edicion->id)
            ->get();

        foreach ($resultados as $resultado) {
            switch ($resultado->id_categoria) {
                case 1:
                    $totalPorCategoria['superpegues'] += $resultado->cantidad;
                    break;
                case 2:
                    $totalPorCategoria['peques'] += $resultado->cantidad;
                    break;
                case 3:
                    $totalPorCategoria['benjamin'] += $resultado->cantidad;
                    break;
                case 4:
                    $totalPorCategoria['cadete'] += $resultado->cantidad;
                    break;
                case 5:
                    $totalPorCategoria['junior'] += $resultado->cantidad;
                    break;
                case 6:
                    $totalPorCategoria['senior'] += $resultado->cantidad;
                    break;
            }
            $totalPorCategoria['total'] += $resultado->cantidad;
        }

        return $totalPorCategoria;
    }
    // Función para actualizar las fechas de la edición 
    public function marcarFechasEdicion(Request $request) {
        // Validación de los datos 
        $request->validate([
            'fecha_convocatoria' => 'required|date',
            'fecha_inic_preinscrip' => 'required|date',
            'fecha_fin_preinscrip' => 'required|date',
            'fecha_inic_inscripVille' => 'required|date',
        ]);

        // Verificar si la edición esta abierta 
        $edicionActual = Edicion::where('abierto', true)->first();  
        if (!$edicionActual) {  
            return response()->json(['message' => 'No puede actualizar las fechas'], 404);  
        }
        
        // Actualizar las fechas 
        $edicionActual->update([  
            'fecha_convocatoria' => $request->fecha_convocatoria,  
            'fecha_inic_preinscrip' => $request->fecha_inic_preinscrip,  
            'fecha_fin_preinscrip' => $request->fecha_fin_preinscrip,  
            'fecha_inic_inscripVille' => $request->fecha_inic_inscripVille,  
        ]);

        return response()->json(['message' => 'Fecha actualizadas con éxito'], 200);
    }
    // Función para actualizar las fechas considerados importantes 
    public function marcarFechasImportantes(Request $request) {
        $request->validate([
            'fecha_resultados' => 'required|date',
            'fecha_inic_realiz' => 'required|date',
            'fecha_fin_realiz' => 'required|date',
            
        ]);
        // Verificar si la edición esta abierta 
        $edicionActual = Edicion::where('abierto', true)->first();  
        if (!$edicionActual) {  
            return response()->json(['message' => 'No puede actualizar las fechas'], 404);  
        }
        // Actualizar las fechas 
        $edicionActual->update([  
            'fecha_resultados' => $request->fecha_resultados,  
            'fecha_inic_realiz' => $request->fecha_inic_realiz,  
            'fecha_fin_realiz' => $request->fecha_fin_realiz,  
        ]);
        return response()->json(['message' => 'Fecha actualizadas con éxito'], 200);
    }

    /**
     * Vista previa de totales por provincia/categoría antes de publicar en la página inicial.
     */
    public function vistaPreviaPublicacion(int $nEdicion)
    {
        $edicion = Edicion::where('n_edicion', $nEdicion)->first();
        if (!$edicion) {
            return response()->json(['success' => false, 'message' => 'Edición no encontrada.'], 404);
        }

        $conteos = $this->conteosProvinciaCategoria($edicion);
        $totalEstudiantes = (int) array_sum(array_map(fn ($r) => (int) $r->cantidad, $conteos));
        $provincias = collect($conteos)->pluck('id_provincia')->unique()->count();

        $yaPublicado = ResultadosProvincias::where('id_edicion', $edicion->id)
            ->where('id_categoria', '!=', 7)
            ->exists();

        return response()->json([
            'success' => true,
            'n_edicion' => $edicion->n_edicion,
            'a_edicion' => (int) $edicion->a_edicion,
            'total_estudiantes' => $totalEstudiantes,
            'provincias_con_datos' => $provincias,
            'filas_agregadas' => count($conteos),
            'ya_publicado' => $yaPublicado,
        ]);
    }

    /**
     * Calcula totales desde estudiante_escuela y los escribe en resultados_provincias (página inicial).
     */
    public function publicarResultadosWeb(int $nEdicion)
    {
        $edicion = Edicion::where('n_edicion', $nEdicion)->first();
        if (!$edicion) {
            return response()->json(['success' => false, 'message' => 'Edición no encontrada.'], 404);
        }

        $conteos = $this->conteosProvinciaCategoria($edicion);
        if (empty($conteos)) {
            return response()->json([
                'success' => false,
                'message' => 'No hay resultados oficiales en estudiante_escuela para publicar. Importe, revise e integre al histórico primero.',
            ], 422);
        }

        $totalEstudiantes = (int) array_sum(array_map(fn ($r) => (int) $r->cantidad, $conteos));

        DB::transaction(function () use ($edicion, $conteos) {
            ResultadosProvincias::where('id_edicion', $edicion->id)->delete();

            $now = now();
            foreach ($conteos as $fila) {
                ResultadosProvincias::create([
                    'id_edicion' => $edicion->id,
                    'id_provincia' => $fila->id_provincia,
                    'id_categoria' => $fila->id_categoria,
                    'cantidad' => (int) $fila->cantidad,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Resultados de la {$edicion->n_edicion}ª edición ({$edicion->a_edicion}) publicados en la página inicial.",
            'n_edicion' => $edicion->n_edicion,
            'a_edicion' => (int) $edicion->a_edicion,
            'total_estudiantes' => $totalEstudiantes,
            'filas_insertadas' => count($conteos),
        ]);
    }

    /**
     * @return array<int, object{id_provincia: int, id_categoria: int, cantidad: int}>
     */
    private function conteosProvinciaCategoria(Edicion $edicion): array
    {
        $idEdicion = $edicion->id;
        $nEdicion = $edicion->n_edicion;

        return DB::table('estudiante_escuela as ee')
            ->join('escuelas as esc', 'esc.id', '=', 'ee.id_escuela')
            ->join('municipios as m', 'm.codigo', '=', 'esc.cdgo_municipio')
            ->join('provincias as p', 'p.codigo', '=', 'm.cdgo_provincia')
            ->where(function ($q) use ($idEdicion, $nEdicion) {
                $q->where('ee.edicion', $idEdicion)->orWhere('ee.edicion', $nEdicion);
            })
            ->where('ee.id_categoria', '!=', 7)
            ->where(function ($q) {
                $q->whereNotNull('ee.puntuacion')->orWhereNotNull('ee.medalla');
            })
            ->select('p.id as id_provincia', 'ee.id_categoria', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('p.id', 'ee.id_categoria')
            ->get()
            ->all();
    }
}
