<?php

namespace App\Http\Controllers;

use App\Models\CertificadoGenerado;
use Illuminate\Support\Facades\DB;

class VerificarCertificadoController extends Controller
{
    public function verificar($hash)
    {
        $certificado = CertificadoGenerado::where('hash', $hash)
            ->where('valido', true)
            ->first();

        if ($certificado) {
            $nombreProfesor = null;

            if (
                $certificado->tipo === 'maestro_colaborador'
                && !empty($certificado->id_profesor)
            ) {
                $usuario = DB::table('users')
                    ->where('id', $certificado->id_profesor)
                    ->first();

                if ($usuario) {
                    $nombreProfesor = trim(
                        ($usuario->nombre ?? '') . ' ' .
                            ($usuario->apellidos ?? '')
                    );
                }
            }

            return view('certificados.verificar', [
                'certificado'    => $certificado,
                'nombreProfesor' => $nombreProfesor,
            ]);
        }

        $certificadoHistorico = DB::table('certificados_historicos')
            ->where('hash', $hash)
            ->where('valido', true)
            ->first();

        if ($certificadoHistorico) {
            $nombreProfesor = null;

            if ($certificado->tipo === 'maestro_colaborador' && $certificado->id_profesor) {

                $usuario = DB::table('users')
                    ->where('id', $certificado->id_profesor)
                    ->first();

                if ($usuario) {
                    $nombreProfesor = trim(
                        ($usuario->nombre ?? '') . ' ' .
                            ($usuario->apellidos ?? '')
                    );
                }
            }

            return view('certificados.verificar', [
                'certificado' => $certificado,
                'nombreProfesor' => $nombreProfesor,
            ]);
        }

        return response('Certificado no encontrado o no válido.', 404);
    }
}
