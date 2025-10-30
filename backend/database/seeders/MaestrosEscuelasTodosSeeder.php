<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MaestrosEscuelasTodosSeeder extends Seeder
{
    public function run()
    {
        // Precargar datos existentes
        $ediciones = DB::table('ediciones')->pluck('id', 'a_edicion')->toArray();
        $municipios = DB::table('municipios')->pluck('codigo', 'nombre')->toArray();
        $subsistemas = DB::table('subsistema_escuelas')->pluck('id', 'nombre')->toArray();

        // Cargar datos desde Excel
        $rutaXlsx = __DIR__ . DIRECTORY_SEPARATOR . 'MaestrosTODOS.xlsx';
        if (!is_file($rutaXlsx)) {
            $this->command->error("No existe el archivo Excel: $rutaXlsx");
            return;
        }

        $spreadsheet = IOFactory::load($rutaXlsx);
        $sheet = $spreadsheet->getActiveSheet();
        $highestRow = $sheet->getHighestDataRow();
        $highestCol = $sheet->getHighestDataColumn();

         // Leer cabeceras
        $headers = [];
        $headerRow = 1;
        foreach ($sheet->rangeToArray("A$headerRow:$highestCol$headerRow", null, true, true, true) as $row) {
            foreach ($row as $col => $value) {
                $key = trim((string)$value);
                if ($key === '') continue;
                $norm = strtolower(str_replace([' ', '-'], ['_', '_'], $key));
                $headers[$col] = $norm;
            }
        }

        $this->command->info("Procesando $highestRow filas del Excel...");

        $contadores = [
            'usuarios_creados' => 0,
            'profesores_creados' => 0,
            'escuelas_creadas' => 0,
            'relaciones_creadas' => 0
        ];

        for ($r = 2; $r <= $highestRow; $r++) {
            $rowData = $sheet->rangeToArray("A$r:$highestCol$r", null, true, true, true);
            $rowArr = reset($rowData);
            
            // Si no hay correo, saltar
            $correo = isset($rowArr['C']) ? trim((string)$rowArr['C']) : '';
            if ($correo === '') continue;

            // Extraer datos normalizados
            $item = [];
            foreach ($rowArr as $col => $val) {
                if (!isset($headers[$col])) continue;
                $item[$headers[$col]] = is_string($val) ? trim($val) : $val;
            }

            // Validar datos críticos
            $edicionAnio = (int)($item['edicion'] ?? 0);
            if (!isset($ediciones[$edicionAnio])) {
                $this->command->warn("Fila $r - Edición $edicionAnio no existe, omitiendo");
                continue;
            }

            $edicionId = $ediciones[$edicionAnio];

            // 1. GESTIONAR USUARIO
            $usuario = DB::table('users')->where('correo', $correo)->first();
            if (!$usuario) {
                // Crear nuevo usuario
                $usuarioId = DB::table('users')->insertGetId([
                    'correo' => $correo,
                    'contrasenia' => Hash::make($item['contrasenia_teacher'] ?? 'Bebras2024'),
                    'pin' => Hash::make($item['pin_teacher'] ?? '1234'),
                    'nombre' => $item['nombre_teacher'] ?? 'NOnombre',
                    'apellidos' => $item['apellidos_teacher'] ?? 'NOapellidos',
                    'nro_ci' => $item['nro_ci_teacher'] ?? null,
                    'telefono' => $item['telefono_teacher'] ?? '00000000',
                    'foto_perfil' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $contadores['usuarios_creados']++;
                $this->command->info("Usuario creado: $correo");
            } else {
                $usuarioId = $usuario->id;
            }

            // 2. GESTIONAR PROFESOR
            $profesor = DB::table('profesores')->where('user_id', $usuarioId)->first();
            if (!$profesor) {
                $profesorId = DB::table('profesores')->insertGetId([
                    'user_id' => $usuarioId,
                    'es_nuevo' => false,
                    'perfil_editado' => true,
                    'esta_activo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $contadores['profesores_creados']++;
                $this->command->info("Profesor creado para: $correo");
            } else {
                $profesorId = $profesor->id;
            }

            // 3. GESTIONAR ESCUELA
            $municipioNombre = $item['municipio_school'] ?? '';
            $subsistemaNombre = $item['subsistema_school'] ?? '';
            
            // Buscar municipio
            if (!isset($municipios[$municipioNombre])) {
                $this->command->warn("Fila $r - Municipio no encontrado: $municipioNombre");
                continue;
            }

            // Buscar subsistema
            if (!isset($subsistemas[$subsistemaNombre])) {
                      $this->command->warn("Fila $r - Subsistema no encontrado: $subsistemaNombre");
                continue;
            }

            $codigoMunicipio = $municipios[$municipioNombre];
            $codigoEscuela = $item['codigo_school'] ?: null;
            $nombreEscuela = $item['nombre_school'] ?? $item['school_teacher'] ?? 'Escuela sin nombre';
            $subsistemaId = $subsistemas[$subsistemaNombre];

            // Buscar escuela
            $escuela = null;
            if ($codigoEscuela) {
                $escuela = DB::table('escuelas')
                    ->where('codigo', $codigoEscuela)
                    ->first();
            }

            if (!$escuela) {
                // Buscar por nombre, municipio y subsistema
                $escuela = DB::table('escuelas')
                    ->where('nombre', $nombreEscuela)
                    ->where('cdgo_municipio', $codigoMunicipio)
                    ->where('subsistema_id', $subsistemaId)
                    ->first();
            }

            if (!$escuela) {
                // Crear nueva escuela
                $escuelaId = DB::table('escuelas')->insertGetId([
                    'codigo' => $codigoEscuela,
                    'nombre' => $nombreEscuela,
                    'telefono' => $item['telefono_school'] ?? null,
                    'cdgo_municipio' => $codigoMunicipio,
                    'poblado' => $item['poblado_school'] ?? null,
                    'subsistema_id' => $subsistemaId,
                    'activo' => true,
                    'validado' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $contadores['escuelas_creadas']++;
                $this->command->info("Escuela creada: $nombreEscuela");
            } else {
                $escuelaId = $escuela->id;
            }

            // 4. CREAR RELACIÓN PROFESOR-ESCUELA-EDICIÓN
            $relacionExistente = DB::table('profesor_escuela')
                ->where('edicion', $edicionId)
                ->where('id_escuela', $escuelaId)
                ->where('id_profesor', $profesorId)
                ->exists();

            if (!$relacionExistente) {
                DB::table('profesor_escuela')->insert([
                    'edicion' => $edicionId,
                    'id_escuela' => $escuelaId,
                    'id_profesor' => $profesorId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $contadores['relaciones_creadas']++;
                $this->command->info("Relación creada: Profesor $correo -> Escuela $nombreEscuela (Edición $edicionAnio)");
            } else {
                $this->command->info("Relación ya existe: Profesor $correo -> Escuela $nombreEscuela (Edición $edicionAnio)");
            }
        }

        // RESUMEN
        $this->command->info("=== RESUMEN DE PROCESAMIENTO ===");
        $this->command->info("Usuarios creados: " . $contadores['usuarios_creados']);
        $this->command->info("Profesores creados: " . $contadores['profesores_creados']);
        $this->command->info("Escuelas creadas: " . $contadores['escuelas_creadas']);
        $this->command->info("Relaciones profesor-escuela-edición creadas: " . $contadores['relaciones_creadas']);
    }
}