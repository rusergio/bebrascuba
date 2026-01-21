<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoordRegionalesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener ediciones
        $edicion2022 = DB::table('ediciones')->where('a_edicion', 2022)->first();
        $edicion2023 = DB::table('ediciones')->where('a_edicion', 2023)->first();
        $edicion2024 = DB::table('ediciones')->where('a_edicion', 2024)->first();

        if (!$edicion2022 || !$edicion2023 || !$edicion2024) {
            $this->command->error('Las ediciones 2022/2023/2024 no existen. Ejecuta primero EdicionesSeeder.');
            return;
        }

        // Obtener roles
        $rolProv = DB::table('roles')->where('rol', 'Coordinador Provincial MINED')->first();
        $rolMun = DB::table('roles')->where('rol', 'Coordinador Municipal MINED')->first();

        if (!$rolProv || !$rolMun) {
            $this->command->error('Los roles necesarios no existen. Ejecuta RolSeeder.');
            return;
        }
        //ESTO SOLO PARA DEPURAR - COMENTADO PARA NO BORRAR DATOS DE OTRAS EDICIONES
        // ADVERTENCIA: Si descomentas esto, borrará TODOS los estudiantes de TODAS las ediciones
        DB::table('coord_regionales')->truncate();

        // Lista de coordinadores regionales (provinciales y municipales)
        // Ahora aceptamos nombres de provincia/municipio y los resolvemos por nombre.
        $coordinadores = [
            // Coordinador provincial Pinar del Río (provincia nombre 'Pinar del Río') - edición 2024
            [
                'user' => [
                    'nombre' => 'María',
                    'apellidos' => 'González Pérez',
                    'correo' => 'mgonzalez@mined.cu',
                    'nro_ci' => '64111000111',
                    'telefono' => '52220011',
                    'contrasenia' => 'Prov2024#',
                    'pin' => '0001'
                ],
                'edicion' => $edicion2024->id,
                'provincia' => 'Pinar del Río',
                'municipio' => null,
                'descripcion' => 'Coordinadora provincial Pinar del Río 2024',
                'fecha_inicio' => '2024-03-01',
                'fecha_fin' => null
            ],

            // Coordinador provincial La Habana - edición 2024
            [
                'user' => [
                    'nombre' => 'Carlos',
                    'apellidos' => 'Ruiz Hernández',
                    'correo' => 'cruiz@mined.cu',
                    'nro_ci' => '64111000222',
                    'telefono' => '53770022',
                    'contrasenia' => 'Habana2024#',
                    'pin' => '0002'
                ],
                'edicion' => $edicion2024->id,
                'provincia' => 'La Habana',
                'municipio' => null,
                'descripcion' => 'Coordinador provincial La Habana 2024',
                'fecha_inicio' => '2024-04-01',
                'fecha_fin' => null
            ],

            // Coordinador municipal Santiago de Cuba (provincia 'Santiago de Cuba', municipio 'Santiago de Cuba') - edición 2023
            [
                'user' => [
                    'nombre' => 'Ana',
                    'apellidos' => 'López Díaz',
                    'correo' => 'alopez@mined.cu',
                    'nro_ci' => '64111000333',
                    'telefono' => '53330033',
                    'contrasenia' => 'Stgo2023#',
                    'pin' => '0003'
                ],
                'edicion' => $edicion2023->id,
                'provincia' => 'Santiago de Cuba',
                'municipio' => 'Santiago de Cuba',
                'descripcion' => 'Coordinadora municipal Santiago de Cuba 2023',
                'fecha_inicio' => '2023-05-01',
                'fecha_fin' => '2024-02-28'
            ],

            // Coordinador municipal Santa Clara (provincia 'Villa Clara', municipio 'Santa Clara') - edición 2024
            [
                'user' => [
                    'nombre' => 'Dan',
                    'apellidos' => 'G Lio',
                    'correo' => 'dglio@mined.cu',
                    'nro_ci' => '64111000444',
                    'telefono' => '52550044',
                    'contrasenia' => '1234Bebras/*-+',
                    'pin' => '0004'
                ],
                'edicion' => $edicion2024->id,
                'provincia' => 'Villa Clara',
                'municipio' => 'Santa Clara',
                'descripcion' => 'Coordinador municipal Santa Clara 2024',
                'fecha_inicio' => '2024-03-01',
                'fecha_fin' => null
            ],

            // Coordinador provincial de Villa Clara (provincia 'Villa Clara') - edición 2024
            [
                'user' => [
                    'nombre' => 'Daniel',
                    'apellidos' => 'Galvez Lio',
                    'correo' => 'dgalvez@uclv.edu.cu',
                    'nro_ci' => '64111122848',
                    'telefono' => '52488305',
                    'contrasenia' => '1234Bebras/*-+',
                    'pin' => '0004'
                ],
                'edicion' => $edicion2024->id,
                'provincia' => 'Villa Clara',
                'municipio' => null,
                'descripcion' => 'Coordinador provincial Villa Clara 2024',
                'fecha_inicio' => '2024-03-01',
                'fecha_fin' => null
            ]
        ];

        foreach ($coordinadores as $coord) {
            // Resolver provincia y municipio por nombre (case-insensitive)
            $prov = DB::table('provincias')
                ->whereRaw('LOWER(nombre) = ?', [mb_strtolower($coord['provincia'])])
                ->first();

            if (!$prov) {
                $this->command->error("Provincia '{$coord['provincia']}' no encontrada. Ejecuta ProvinciaSeeder.");
                continue;
            }

            $mun = null;
            if (!is_null($coord['municipio']) && $coord['municipio'] !== '') {
                // Los municipios guardan la columna 'cdgo_provincia' (código de la provincia), por eso filtramos por nombre y cdgo_provincia
                $mun = DB::table('municipios')
                    ->whereRaw('LOWER(nombre) = ?', [mb_strtolower($coord['municipio'])])
                    ->where('cdgo_provincia', $prov->codigo)
                    ->first();

                if (!$mun) {
                    $this->command->error("Municipio '{$coord['municipio']}' en provincia '{$coord['provincia']}' no encontrado. Ejecuta MunicipioSeeder.");
                    continue;
                }
            }

            // Crear o obtener usuario
            $userId = $this->getOrCreateUser($coord['user']);

            // Verificar existencia según la combinación única
            $existsQuery = DB::table('coord_regionales')
                ->where('user_id', $userId)
                ->where('edicion_id', $coord['edicion'])
                ->where('provincia_id', $prov->id);

            if ($mun) {
                $existsQuery->where('municipio_id', $mun->id);
            } else {
                $existsQuery->whereNull('municipio_id');
            }

            $exists = $existsQuery->exists();

            if ($exists) {
                $this->command->info("Coord regional ya existe para usuario {$userId} en edición {$coord['edicion']}.");
                continue;
            }

            // Insertar registro
            DB::table('coord_regionales')->insert([
                'user_id' => $userId,
                'edicion_id' => $coord['edicion'],
                'provincia_id' => $prov->id,
                'municipio_id' => $mun ? $mun->id : null,
                'descripcion' => $coord['descripcion'],
                'fecha_inicio' => $coord['fecha_inicio'],
                'fecha_fin' => $coord['fecha_fin'],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Asignar rol apropiado
            $roleId = $mun ? $rolMun->id : $rolProv->id;
            $this->assignRole($userId, $roleId);

            $this->command->info("Coord regional creado (user {$userId}) provincia_id={$prov->id} municipio_id=" . ($mun ? $mun->id : 'NULL'));
        }

        $this->command->info('CoordRegionalesSeeder completado.');
    }

    private function getOrCreateUser($userData)
    {
        $user = DB::table('users')->where('correo', $userData['correo'])->first();
        
        if (!$user) {
            $userId = DB::table('users')->insertGetId([
                'nombre' => $userData['nombre'],
                'apellidos' => $userData['apellidos'],
                'correo' => $userData['correo'],
                'nro_ci' => $userData['nro_ci'],
                'telefono' => $userData['telefono'],
                'contrasenia' => \Hash::make($userData['contrasenia']),
                'pin' => \Hash::make($userData['pin']),
                'foto_perfil' => null,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $this->command->info("Usuario creado: {$userData['correo']}");
            return $userId;
        }
        
        return $user->id;
    }

    private function assignRole($userId, $roleId)
    {
        // Verificar si ya tiene el rol
        $exists = DB::table('role_user')
            ->where('user_id', $userId)
            ->where('rol_id', $roleId)
            ->exists();

        if (!$exists) {
            DB::table('role_user')->insert([
                'user_id' => $userId,
                'rol_id' => $roleId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $this->command->info("Rol asignado al usuario ID: $userId");
        } else {
            $this->command->info("Usuario ID $userId ya tiene el rol asignado");
        }
    }
}
