<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class Estudiantes2022bSeeder extends Seeder
{
    public function run()
    {
        // Precargar datos en arrays
        $municipios = DB::table('municipios')->pluck('codigo', 'nombre')->toArray();
        $subsistemas = DB::table('subsistema_escuelas')->pluck('id', 'name')->toArray();
    
        // Precargar usuarios y profesores: array de correo a id_profesor
        $profesores = DB::table('users')
            ->join('profesores', 'users.id', '=', 'profesores.user_id')
            ->pluck('profesores.id', 'users.correo')
            ->toArray();

        // Verificar si existe la edición del 2022
        $anio = 2022;
        $edicion = DB::table('ediciones')->where('a_edicion', $anio)->first();
        if ($edicion) {
            $edicionId = $edicion->id;
        } else {
            $this->command->error("La edicion del año '$anio' no existe. No se vincula escuelas con profesores.");
            return; // termina el seeder sin hacer nada
        }

        // Cargar datos desde Excel externo
        // Leer el Excel desde el mismo directorio del seeder
        $rutaXlsx = __DIR__ . DIRECTORY_SEPARATOR . 'Estudiantes2022b.xlsx';
        if (!is_file($rutaXlsx)) {
            $this->command->error("No existe el archivo Excel: $rutaXlsx");
            return;
        }

        $spreadsheet = IOFactory::load($rutaXlsx);
        $sheet = $spreadsheet->getActiveSheet();
        $highestRow = $sheet->getHighestDataRow();
        $highestCol = $sheet->getHighestDataColumn();

        // Leer cabeceras (fila 1) y normalizar a snake_case simple
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

        $datosEstudiantes = [];
        for ($r = 2; $r <= $highestRow; $r++) {
            $rowArr = $sheet->rangeToArray("A$r:$highestCol$r", null, true, true, true)[0];
            // Si no hay nombre, se asume fin de datos
            $nombre = isset($rowArr['A']) ? trim((string)$rowArr['A']) : '';
            if ($nombre === '') continue;

            $item = [];
            foreach ($rowArr as $col => $val) {
                if (!isset($headers[$col])) continue;
                $item[$headers[$col]] = is_string($val) ? trim($val) : $val;
            }

            // Mapear a claves esperadas por el seeder
            $datosEstudiantes[] = [
                'student_name' => $item['student_name'] ?? '',
                'score' => (int)($item['score'] ?? 0),
                'medal' => $item['medal'] ?? 'Participa',
                'ci' => (string)($item['ci'] ?? ''),
                'grade' => (int)($item['grade'] ?? 0),
                'student_school' => $item['student_school'] ?? '',
                'subsistema_school' => $item['subsistema_school'] ?? '',
                'prov_school' => $item['prov_school'] ?? '',
                'mpio_school' => $item['mpio_school'] ?? '',
                'pobladOrpto_school' => $item['pobladorpto_school'] ?? '',
                'cod_school' => $item['cod_school'] ?? '',
                'sex' => $item['sex'] ?? '',
                'category' => $item['category'] ?? '',
                'year' => (int)($item['year'] ?? $anio),
                'teacher_email' => $item['teacher_email'] ?? '',
            ];
        }

        $vc_cant = 0;
        foreach ($datosEstudiantes as $datos) {
            // 1. Buscar o crear el estudiante
            $estudiante = DB::table('estudiantes')->where('nro_ci', $datos['ci'])->first();
            if (!$estudiante) {
                $estudianteId = DB::table('estudiantes')->insertGetId([
                    'nro_ci' => $datos['ci'],
                    'nombre' => $datos['student_name'],
                    'sexo' => $datos['sex'],
                    'editado' => false,
                    'inscrito' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $estudianteId = $estudiante->id;
            }

            // 2. Buscar el profesor por correo en el array precargado
            if (!isset($profesores[$datos['teacher_email']])) {
                $this->command->error("Profesor no encontrado con correo: " . $datos['teacher_email']);
                continue;
            }
            $profesorId = $profesores[$datos['teacher_email']];

            // 3. Buscar o crear la escuela
            if (!isset($municipios[$datos['mpio_school']])) {
                $this->command->error("Municipio no encontrado: " . $datos['mpio_school']);
                continue;
            }

            if (!isset($subsistemas[$datos['subsistema_school']])) {
                $this->command->error("Subsistema no encontrado: " . $datos['subsistema_school']);
                continue;
            }
        
            $codigoMunicipio = $municipios[$datos['mpio_school']];
            $subsistemaId = $subsistemas[$datos['subsistema_school']];
            if ($datos['prov_school'] == 'Villa Clara' ) {
                $vc_cant++;
                // La BD tiene todas las escuelas de VC 
                // Se buscaria por el codigo de la Escuela
            }
            // El resto del código para buscar/crear escuela
            $escuela = DB::table('escuelas')
                ->where('nombre', $datos['student_school'])
                ->where('cdgo_municipio', $codigoMunicipio)
                ->first();
            if (!$escuela) {
                $escuelaId = DB::table('escuelas')->insertGetId([
                    'nombre' => $datos['student_school'],
                    'cdgo_municipio' => $codigoMunicipio,
                    'poblado' => $datos['pobladOrpto_school'],
                    'subsistema_id' => $subsistemaId,
                    'activo' => true,
                    'validado' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $escuelaId = $escuela->id;
            }
            // 4. Crear la relacion Profesor Estdiante.
            // SE ASUME que los profesores de la edicion fueron creados antes.
            
            // 5. Crear la relación estudiante_escuela
            $estudianteEscuela = DB::table('estudiante_escuela')
                ->where('edicion', $edicionId)
                ->where('id_estudiante', $estudianteId)
                ->where('id_escuela', $escuelaId)
                ->first();

            if (!$estudianteEscuela) {
                DB::table('estudiante_escuela')->insert([
                    'edicion' => $edicionId,
                    'grado' => $datos['grade'],
                    'puntuacion' => $datos['score'],
                    'medalla' => $datos['medal'],
                    'id_estudiante' => $estudianteId,
                    'id_escuela' => $escuelaId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $this->command->info("La relación estudiante-escuela ya existe para el estudiante con ID $estudianteId y la escuela con ID $escuelaId.");
            }
        }
        $this->command->info("Cantidad de escuelas de VC en los datos: $vc_cant" );
    }
}