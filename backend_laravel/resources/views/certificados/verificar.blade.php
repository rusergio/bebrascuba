<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Verificación de Certificado Bebras Cuba</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #eef4fb;
            margin: 0;
            padding: 40px 20px;
            color: #1f2937;
        }

        .container {
            max-width: 980px;
            margin: auto;
            background: white;
            border-radius: 18px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #1d4ed8, #f97316);
            color: white;
            padding: 28px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 30px;
        }

        .valid {
            display: inline-block;
            margin-top: 15px;
            padding: 8px 16px;
            background: #16a34a;
            border-radius: 999px;
            font-weight: bold;
        }

        .content {
            padding: 28px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        .card {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
        }

        .label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 5px;
        }

        .value {
            font-size: 18px;
            font-weight: bold;
        }

        .hash {
            background: #f3f4f6;
            padding: 14px;
            border-radius: 10px;
            word-break: break-all;
            font-size: 13px;
            color: #374151;
            margin-bottom: 24px;
        }

        .certificado-img {
            width: 100%;
            max-width: 900px;
            display: block;
            margin: 20px auto 0;
            border: 1px solid #ddd;
            border-radius: 10px;
        }

        .footer {
            text-align: center;
            padding: 18px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 14px;
        }

        @media (max-width: 700px) {
            .grid {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>

<body>

    <div class="container">
        <div class="header">
            <h1>Verificación de Certificado</h1>
            <p>Bebras Cuba</p>
            <div class="valid">Certificado válido</div>
        </div>

        <div class="content">
            @if($certificado->tipo === 'maestro_colaborador')

            <div class="grid">

                <div class="card">
                    <div class="label">Tipo</div>
                    <div class="value">Maestro / Colaborador</div>
                </div>

                <div class="card">
                    <div class="label">Edición</div>
                    <div class="value">{{ $certificado->edicion }}</div>
                </div>

                <div class="card" style="grid-column: span 2;">
                    <div class="label">Nombre</div>
                    <div class="value">
                        {{ $nombreProfesor }}
                    </div>
                </div>

            </div>

            @else

            <div class="grid">

                <div class="card">
                    <div class="label">Tipo</div>
                    <div class="value">{{ $certificado->tipo }}</div>
                </div>

                <div class="card">
                    <div class="label">Edición</div>
                    <div class="value">{{ $certificado->edicion }}</div>
                </div>

                <div class="card">
                    <div class="label">Categoría</div>
                    <div class="value">{{ $certificado->categoria ?? 'No definida' }}</div>
                </div>

                <div class="card">
                    <div class="label">Medalla</div>
                    <div class="value">{{ $certificado->medalla ?? 'Participación' }}</div>
                </div>

            </div>

            @endif

            <div class="label">Identificador único</div>
            <div class="hash">
                {{ $certificado->hash }}
            </div>

            @if (!empty($certificado->ruta_archivo))
            <img
                class="certificado-img"
                src="{{ asset('storage/' . $certificado->ruta_archivo) }}"
                alt="Certificado Bebras Cuba">
            @endif
        </div>

        <div class="footer">
            Este certificado fue verificado mediante el sistema Bebras Cuba.
        </div>
    </div>

</body>

</html>