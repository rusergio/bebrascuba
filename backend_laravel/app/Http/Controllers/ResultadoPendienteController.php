<?php

namespace App\Http\Controllers;

use App\Http\Concerns\AuthorizesAccess;
use App\Models\ResultadoPendiente;
use Illuminate\Http\Request;

class ResultadoPendienteController extends Controller
{
    use AuthorizesAccess;

    public function index()
    {
        $pendientes = ResultadoPendiente::with('categoria')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendientes,
        ]);
    }

    public function porProfesor(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'correo_profesor' => 'nullable|email',
        ]);

        $correo = strtolower(trim(
            $request->input('correo_profesor', $user->correo ?? '')
        ));

        if ($correo === '') {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo determinar el correo del profesor.',
            ], 422);
        }

        if (
            strtolower(trim((string) $user->correo)) !== $correo
            && !$this->isAdminOrCoordinator($user)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para consultar pendientes de otro profesor.',
            ], 403);
        }

        $pendientes = ResultadoPendiente::with('categoria')
            ->where('correo_profesor', $correo)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendientes,
        ]);
    }

    public function actualizar(Request $request, $id)
    {
        $pendiente = ResultadoPendiente::findOrFail($id);

        $request->validate([
            'escuela_excel' => 'nullable|string|max:255',
            'grado' => 'nullable|integer',
            'sexo' => 'nullable|string|max:20',
            'observaciones' => 'nullable|string',
            'estado' => 'nullable|string|max:50',
        ]);

        $pendiente->update([
            'escuela_excel' => $request->escuela_excel ?? $pendiente->escuela_excel,
            'grado' => $request->grado ?? $pendiente->grado,
            'sexo' => $request->sexo ?? $pendiente->sexo,
            'observaciones' => $request->observaciones ?? $pendiente->observaciones,
            'estado' => $request->estado ?? 'actualizado_por_maestro',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resultado pendiente actualizado correctamente.',
            'data' => $pendiente,
        ]);
    }
}
