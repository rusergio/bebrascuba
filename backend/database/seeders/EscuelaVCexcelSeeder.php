<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class EscuelaVCexcelSeeder extends Seeder
{
    public function run()
    {
        $filePath = database_path('seeders/EscuelasVC.xlsx');
        
        if (!file_exists($filePath)) {
            $this->command->error("Archivo Excel no encontrado: $filePath");
            return;
        }

        // Cargar el archivo Excel
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        // Eliminar la primera fila (encabezados)
        array_shift($rows);

        // Cargar todos los subsistemas en un arreglo asociativo nombre => id
        $subsistemas = DB::table('subsistema_escuelas')->pluck('id', 'nombre')->toArray();
        
        // Cargar todos los municipios en un arreglo asociativo nombre_normalizado => código
        $municipios = DB::table('municipios')->get();
        $municipiosNormalizados = [];
        foreach ($municipios as $municipio) {
            // Normalizar el nombre a minúsculas y sin espacios extras
            $nombreNormalizado = $this->normalizarNombre($municipio->nombre);
            $municipiosNormalizados[$nombreNormalizado] = $municipio->codigo;
        }

        $cont = 0;
        $errors = [];

        //ESTO SOLO POPR EL MOMENTO PARA DEPURAR
        // Vacía la tabla antes de insertar
        
        //ESTO ARRIBA SOLO POPR EL MOMENTO PARA DEPURAR

        foreach ($rows as $row) {
            // Saltar filas vacías
            if (empty($row[0]) || empty($row[1])) {
                $thisd->command->warn("Fila con datos insuficientes (mcpio, nombre), ignorada");
                continue;
            }

            $municipioNombre = trim($row[0]);
            $nombreEscuela = trim($row[1]);
            $codigoEscuela = trim($row[2]);
            $poblado = trim($row[3] ?? '');
            $subsistemaNombre = trim($row[4] ?? '');

            // Validar que el código no esté vacío
            //if (empty($codigoEscuela)) {
            //    $errors[] = "Escuela '{$nombreEscuela}' sin código, ignorada";
            //    continue;
            //}

            // Buscar el código del municipio (sin diferenciar mayúsculas/minúsculas)
            $municipioNombreNormalizado = $this->normalizarNombre($municipioNombre);
            if (!isset($municipiosNormalizados[$municipioNombreNormalizado])) {
                $errors[] = "Municipio '{$municipioNombre}' no existe para la escuela '{$nombreEscuela}' (código: {$codigoEscuela})";
                continue;
            }
            $codigoMunicipio = $municipiosNormalizados[$municipioNombreNormalizado];

            // Buscar el subsistema (también normalizado para evitar problemas)
            $subsistemaNombreNormalizado = $this->normalizarNombre($subsistemaNombre);
            $subsistemaId = null;
            foreach ($subsistemas as $nombreSubsistema => $id) {
                if ($this->normalizarNombre($nombreSubsistema) === $subsistemaNombreNormalizado) {
                    $subsistemaId = $id;
                    break;
                }
            }

            if (!$subsistemaId) {
                $errors[] = "Subsistema '{$subsistemaNombre}' no existe para la escuela '{$nombreEscuela}' (código: {$codigoEscuela})";
                continue;
            }

            // Verificar si la escuela ya existe para evitar duplicados
            $existe = DB::table('escuelas')
                            ->where('nombre', $nombreEscuela)
                            ->where('cdgo_municipio', $codigoMunicipio)
                            ->where('poblado', $poblado)
                            ->where('subsistema_id', $subsistemaId)
                            ->exists();
            if ($existe) {
                $errors[] = "Escuela '{$nombreEscuela}' con código '{$codigoEscuela}' ya existe, ignorada";
                continue;
            }

            // Insertar la escuela
            DB::table('escuelas')->insert([
                'codigo' => $codigoEscuela,
                'nombre' => $nombreEscuela,
                'telefono' => null,
                'cdgo_municipio' => $codigoMunicipio,
                'poblado' => $poblado,
                'subsistema_id' => $subsistemaId,
                'activo' => true,
                'validado' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            $cont++;
        }

        // Mostrar resultados
        $this->command->info("Escuelas insertadas: $cont de " . (count($rows)) . " encontradas en el Excel");
        
        if (!empty($errors)) {
            $this->command->warn("Errores encontrados:");
            foreach ($errors as $error) {
                $this->command->line(" - $error");
            }
        }
    }

    /**
     * Normaliza un nombre para comparación sin diferenciar mayúsculas/minúsculas
     * y eliminando espacios extra
     */
    private function normalizarNombre($nombre)
    {
        return trim(mb_strtolower($nombre, 'UTF-8'));
    }
}