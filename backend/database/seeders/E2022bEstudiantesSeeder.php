<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class E2022bEstudiantesSeeder extends Seeder
{
    public function run()
    {
        // Precargar datos en arrays
        $municipios = DB::table('municipios')->pluck('codigo', 'nombre')->toArray();
        $subsistemas = DB::table('subsistema_escuelas')->pluck('id', 'nombre')->toArray();
    
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
        $rutaXlsx = __DIR__ . DIRECTORY_SEPARATOR . 'E2022bEstudiantesDatos.xlsx';
        if (!is_file($rutaXlsx)) {
            $this->command->error("No existe el archivo Excel: $rutaXlsx");
            return;
        }

        //ESTO SOLO POPR EL MOMENTO PARA DEPURAR
        // Vacía la tabla antes de insertar
        DB::table('estudiantes')->truncate();
        DB::table('profesor_estudiante')->truncate();
        DB::table('estudiante_escuela')->truncate();
       //ESTO ARRIBA SOLO POPR EL MOMENTO PARA DEPURAR

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

        // Verificar que existan las columnas requeridas
        $requiredFields = [
            'student_name', 'score', 'medal', 'ci', 'grade', 
            'student_school', 'subsistema_school', 'prov_school', 
            'mpio_school', 'pobladorpto_school', 'cod_school', 
            'sex', 'category', 'year', 'teacher_email'
        ];
        
        $missingFields = [];
        foreach ($requiredFields as $field) {
            if (!in_array($field, $headers)) {
                $missingFields[] = $field;
            }
        }
        
        if (!empty($missingFields)) {
            $this->command->error("Faltan las siguientes columnas en el Excel:");
            foreach ($missingFields as $field) {
                $this->command->error("- $field");
            }
            $this->command->error("Columnas encontradas: " . implode(', ', $headers));
            return;
        }
        $this->command->info("Valor de highestRow: $highestRow");
        $this->command->info("Todas las columnas requeridas están presentes en el Excel.");

        $datosEstudiantes = [];

        //solo dejar el ciclo for original
        $this->command->info("highestRow: $highestRow, highestCol: $highestCol");
        for ($r = 2; $r <= $highestRow; $r++) {
            $this->command->info("Procesando fila $r");

            $rowData = $sheet->rangeToArray("A$r:$highestCol$r", null, true, true, true);
            $rowArr = reset($rowData);
            // Si no hay nombre, se asume fin de datos
            $nombre = isset($rowArr['A']) ? trim((string)$rowArr['A']) : '';
            if ($nombre === '') continue;

            $item = [];
            foreach ($rowArr as $col => $val) {
                if (!isset($headers[$col])) continue;
                $item[$headers[$col]] = is_string($val) ? trim($val) : $val;
            }

            // Validar datos críticos antes de agregar
            //$ci = trim((string)($item['ci'] ?? ''));
            $studentName = trim($item['student_name'] ?? '');
            $teacherEmail = trim($item['teacher_email'] ?? '');

            if (empty($studentName) || empty($teacherEmail)) { //$ci) ||  eliminado provisionalmente
                $this->command->warn("Fila $r omitida - datos críticos faltantes: CI='$ci', Nombre='$studentName', Email='$teacherEmail'");
                continue;
            }
            if (empty($item['ci']) || strlen($item['ci']) > 11) {
                $this->command->warn("Fila $r - CI inválido o vacío, se asignará NULL: CI='" . ($item['ci'] ?? '') . "'");
                $item['ci'] = null; //null si no tiene CI
            }

            // Mapear a claves esperadas por el seeder
            $datosEstudiantes[] = [
                'student_name' => $studentName,
                'score' => (int)($item['score'] ?? 0),
                'medal' => $item['medal'] ?? 'Participa',
                'ci' => $item['ci'],            //OJO - null si no tiene CI
                'grade' => (int)($item['grade'] ?? 0),
                'student_school' => trim($item['student_school'] ?? ''),
                'subsistema_school' => trim($item['subsistema_school'] ?? ''),
                'prov_school' => trim($item['prov_school'] ?? ''),
                'mpio_school' => trim($item['mpio_school'] ?? ''),
                'pobladOrpto_school' => trim($item['pobladorpto_school'] ?? ''),
                'cod_school' => trim($item['cod_school'] ?? ''),
                'sex' => trim($item['sex'] ?? ''),
                'category' => trim($item['category'] ?? ''),
                'year' => (int)($item['year'] ?? $anio),
                'teacher_email' => $teacherEmail,
            ];  
        }

        $vc_cant = 0;
        $vc_ccod = 0;
        $cont_est = 0;
        // Procesar cada estudiante
        foreach ($datosEstudiantes as $datos) {
            // 1. Buscar o crear el estudiante
            $estudiante = DB::table('estudiantes')
                ->where('nombre', $datos['student_name']) // antes 'ci', pero NO todos tienen CI único
                ->first();
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
                $cont_est++;
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
            }
            $escuela = null;
            // Si tiene código, buscar primero por código
            if ($datos['cod_school']) {
                // Se buscaria por el codigo de la Escuela
                $escuela = DB::table('escuelas')
                    ->where('codigo', $datos['cod_school'])
                    ->first();
                    
                if ($escuela) {
                    $this->command->info("Escuela encontrada por código: {$datos['cod_school']} - {$escuela->nombre}");
                    $vc_ccod++;
                    $escuelaId = $escuela->id;
                } else {
                    $this->command->error("Escuela con código '{$datos['cod_school']}' no encontrada. Debe existir previamente.");
                    $this->command->error("No se asociará el estudiante {$datos['student_name']}.");
                    continue;
                }
            } else {
                // Si no tiene código, buscar por nombre, municipio y subsistema
                $escuela = DB::table('escuelas')
                    ->where('nombre', $datos['student_school'])
                    ->where('cdgo_municipio', $codigoMunicipio)
                    ->where('subsistema_id', $subsistemaId)
                    ->first();
                    
                if (!$escuela) {
                    $this->command->info("Escuela no encontrada, creando nueva: {$datos['student_school']}");
                    $escuelaId = DB::table('escuelas')->insertGetId([
                        'codigo' => null,
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
            }

            // 4. Buscar o crear la relación profesor_escuela para la edición
            /*
             * NO ES NECESARIO: La escuela del profesor debe colocarse en el seeder del profesor
            $profesorEscuela = DB::table('profesor_escuela')
                ->where('edicion', $edicionId)
                ->where('id_escuela', $escuelaId)
                ->where('id_profesor', $profesorId)
                ->first();

            if (!$profesorEscuela) {
                DB::table('profesor_escuela')->insert([
                    'edicion' => $edicionId,
                    'id_escuela' => $escuelaId,
                    'id_profesor' => $profesorId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else  {
                $profesorId = $profesorEscuela->id_profesor;
                $this->command->info("La escuela '" . $datos['student_school'] . "' ya está vinculada al profesor con correo '" 
                                    . $datos['teacher_email'] . "' para la edición $anio.");
            }
            */
            // 5. buscar id de la categoria
            $categoria = DB::table('categorias')
                ->where('nombre_cuba', $datos['category'])
                ->first();
            if (!$categoria) {
                $this->command->error("Categoría no encontrada: " . $datos['category']);
                continue;
            }
            // 6. Crear la relación estudiante_escuela
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
                    'id_categoria' => $categoria->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $this->command->info("La relación estudiante-escuela ya existe para el estudiante con ID $estudianteId y la escuela con ID $escuelaId.");
            }
        }
        
        $this->command->info("=== RESUMEN DE PROCESAMIENTO ===");
        $this->command->info("Total de registros procesados del Excel: " . count($datosEstudiantes));
        $this->command->info("CANTIDAD Estudiante - manual: $cont_est");
        $this->command->info("Cantidad de escuelas de VC en los datos: $vc_cant");
        $this->command->info("Cantidad de escuelas con código en VC: $vc_ccod");
    }
}