<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>@yield('title', 'Bebras Cuba')</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #eef4fb;
            color: #1f2937;
        }

        .app {
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            width: 260px;
            background: linear-gradient(180deg, #1d4ed8, #0f172a);
            color: white;
            padding: 24px 18px;
        }

        .brand {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .brand-subtitle {
            font-size: 13px;
            color: #dbeafe;
            margin-bottom: 30px;
        }

        .nav-section {
            margin-bottom: 24px;
        }

        .nav-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #bfdbfe;
            margin-bottom: 8px;
            letter-spacing: .05em;
        }

        .nav-link {
            display: block;
            color: white;
            text-decoration: none;
            padding: 10px 12px;
            border-radius: 8px;
            margin-bottom: 6px;
            font-size: 14px;
        }

        .nav-link:hover,
        .nav-link.active {
            background: rgba(255, 255, 255, 0.16);
        }

        .content {
            flex: 1;
            padding: 28px;
        }

        .topbar {
            background: white;
            border-radius: 16px;
            padding: 18px 22px;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
            margin-bottom: 24px;
        }

        .topbar h1 {
            margin: 0;
            font-size: 26px;
        }

        .topbar p {
            margin: 6px 0 0;
            color: #6b7280;
        }

        .card {
            background: white;
            border-radius: 16px;
            padding: 22px;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
            margin-bottom: 22px;
        }

        .btn {
            display: inline-block;
            padding: 9px 14px;
            border-radius: 8px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            font-size: 14px;
            border: none;
            cursor: pointer;
        }

        .btn-success {
            background: #16a34a;
        }

        .btn-dark {
            background: #374151;
        }

        .btn-warning {
            background: #f97316;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        th {
            text-align: left;
            background: #f3f4f6;
            color: #374151;
            font-size: 14px;
        }

        th,
        td {
            padding: 12px 10px;
            border-bottom: 1px solid #e5e7eb;
        }

        .badge {
            padding: 5px 9px;
            border-radius: 999px;
            font-size: 13px;
            display: inline-block;
        }

        .badge-ok {
            background: #dcfce7;
            color: #166534;
        }

        .badge-pending {
            background: #fee2e2;
            color: #991b1b;
        }

        .badge-gold {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-silver {
            background: #e5e7eb;
            color: #374151;
        }

        .badge-bronze {
            background: #fed7aa;
            color: #9a3412;
        }

        .actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 18px;
        }

        @media (max-width: 900px) {
            .app {
                flex-direction: column;
            }

            .sidebar {
                width: 100%;
            }

            .content {
                padding: 18px;
            }
        }
    </style>
</head>

<body>

    <div class="app">
        <aside class="sidebar">
            <div class="brand">Bebras Cuba</div>
            <div class="brand-subtitle">Sistema de gestión del concurso</div>

            <div class="nav-section">
                <div class="nav-title">Profesor</div>

                <a class="nav-link" href="/profesor/dashboard">
                    Panel profesor
                </a>

                <a class="nav-link" href="/profesor/mis-certificados">
                    Mis certificados
                </a>
            </div>

            <div class="nav-section">
                <div class="nav-title">Coordinador</div>

                <a class="nav-link" href="/coordinador/dashboard">
                    Panel coordinador
                </a>

                <a class="nav-link" href="/importar-resultados">
                    Importar resultados
                </a>

                <a class="nav-link" href="/calcular-medallas">
                    Medallas
                </a>

                <a class="nav-link" href="/plantillas-certificados">
                    Plantillas
                </a>

                <a class="nav-link" href="/coordinador/resultados-pendientes">
                    Resultados pendientes
                </a>

                <a class="nav-link" href="/coordinador/certificados-colaboradores">
                    Certificados colaboradores
                </a>
            </div>

            <div class="nav-section">
                <div class="nav-title">Verificación</div>

                <a class="nav-link" href="/coordinador/certificados-historicos">
                    Certificados históricos
                </a>
            </div>
        </aside>

        <main class="content">
            <div class="topbar">
                <h1>@yield('page_title', 'Panel Bebras Cuba')</h1>
                <p>@yield('page_subtitle', 'Gestión académica del concurso Bebras Cuba')</p>
            </div>

            @yield('content')
        </main>
    </div>

</body>

</html>
