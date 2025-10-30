<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoordNacionalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener IDs de ediciones
        $edicion2022 = DB::table('ediciones')->where('a_edicion', 2022)->first();
        $edicion2023 = DB::table('ediciones')->where('a_edicion', 2023)->first();
        $edicion2024 = DB::table('ediciones')->where('a_edicion', 2024)->first();

        if (!$edicion2022 || !$edicion2023 || !$edicion2024) {
            $this->command->error('Las ediciones no existen. Ejecuta primero EdicionesSeeder.');
            return;
        }

        // Obtener ID del rol Coordinador Nacional
        $rolCoordinador = DB::table('roles')->where('rol', 'Coordinador Nacional')->first();
        $rolAsistente = DB::table('roles')->where('rol', 'Coordinador Asistente')->first();

        if (!$rolCoordinador || !$rolAsistente) {
            $this->command->error('Los roles no existen. Ejecuta primero RolSeeder.');
            return;
        }

        $coordinadores = [
            // Edición 2022
            [
                'user_id' => $this->getOrCreateUser([
                    'nombre' => 'Daniel',
                    'apellidos' => 'Gálvez Lio',
                    'correo' => 'dgalvez@uclv.edu.cu',
                    'nro_ci' => '64111222848',
                    'telefono' => '52488305',
                    'contrasenia' => '1234Bebras/*-+',
                    'pin' => '4488'
                ]),
                'edicion_id' => $edicion2022->id,
                'tipo' => 'coordinador',
                'descripcion' => 'Coordinador Nacional 2022. Dr/Profesor de Computación. Decano FMFC-UCLV.',
                'fecha_inicio' => '2021-09-01',
                'fecha_fin' => '2023-03-31'
            ],
            [
                'user_id' => $this->getOrCreateUser([
                    'nombre' => 'Pedro Leonardo',
                    'apellidos' => 'Rodríguez Quintana',
                    'correo' => 'perquintana@uclv.cu',
                    'nro_ci' => '11134567890',
                    'telefono' => '53111111',
                    'contrasenia' => 'Asistente2022',
                    'pin' => '1234'
                ]),
                'edicion_id' => $edicion2022->id,
                'tipo' => 'asistente',
                'descripcion' => 'Asistente Nacional 2022. MSc/Profesor de Matemática. FMFC-UCLV.',
                'fecha_inicio' => '2021-01-09',
                'fecha_fin' => '2023-08-30'
            ],

            // Edición 2023
            [
                'user_id' => $this->getOrCreateUser([
                    'nombre' => 'Daniel',
                    'apellidos' => 'Gálvez Lio',
                    'correo' => 'dgalvez@uclv.edu.cu',
                    'nro_ci' => '64111222848',
                    'telefono' => '52488305',
                    'contrasenia' => '1234Bebras/*-+',
                    'pin' => '4488'
                ]),
                'edicion_id' => $edicion2023->id,
                'tipo' => 'coordinador',
                'descripcion' => 'Coordinador Nacional 2022. Dr/Profesor de Computación. Decano FMFC-UCLV.',
                'fecha_inicio' => '2023-04-01',
                'fecha_fin' => '2024-03-31'
            ],
            [
                'user_id' => $this->getOrCreateUser([
                    'nombre' => 'Leonardo',
                    'apellidos' => 'Trujillo',
                    'correo' => 'noname@noname.cu',
                    'nro_ci' => '12345678912',
                    'telefono' => '53556789',
                    'contrasenia' => '1234Bebras/*-+',
                    'pin' => '1234'
                ]),
                'edicion_id' => $edicion2023->id,
                'tipo' => 'asistente',
                'descripcion' => 'Asistente Nacional 2023. Profesor de Computacion. FMFC-UCLV.',
                'fecha_inicio' => '2023-09-01',
                'fecha_fin' => '2024-02-01'
            ],

            // Edición 2024
            [
                'user_id' => $this->getOrCreateUser([
                    'nombre' => 'Daniel',
                    'apellidos' => 'Gálvez Lio',
                    'correo' => 'dgalvez@uclv.edu.cu',
                    'nro_ci' => '64111222848',
                    'telefono' => '52488305',
                    'contrasenia' => '',
                    'pin' => '4488'
                ]),
                'edicion_id' => $edicion2024->id,
                'tipo' => 'coordinador',
                'descripcion' => 'Coordinador Nacional 2024. Dr/Profesor de Computación. Decano FMFC-UCLV.',
                'fecha_inicio' => '2024-04-01',
                'fecha_fin' => null // Activo
            ],
            [
                'user_id' => $this->getOrCreateUser([
                    'nombre' => 'Luis Daniel',
                    'apellidos' => 'Ríos Miliam',
                    'correo' => 'noname@uclv.cu',
                    'nro_ci' => '00141212345',
                    'telefono' => '545881411234Bebras/*-+',
                    'contrasenia' => '1234Bebras/*-+',
                    'pin' => '1234'
                ]),
                'edicion_id' => $edicion2024->id,
                'tipo' => 'asistente',
                'descripcion' => 'Asistente Nacional 2024. Profesor de Matemática. FMFC-UCLV.',
                'fecha_inicio' => '2024-01-01',
                'fecha_fin' => '2025-01-30'
            ]    
        ];

        foreach ($coordinadores as $coordData) {
            // Verificar si ya existe
            $existe = DB::table('coord_nacionales')
                ->where('user_id', $coordData['user_id'])
                ->where('edicion_id', $coordData['edicion_id'])
                ->exists();

            if (!$existe) {
                DB::table('coord_nacionales')->insert([
                    'user_id' => $coordData['user_id'],
                    'edicion_id' => $coordData['edicion_id'],
                    'tipo' => $coordData['tipo'],
                    'descripcion' => $coordData['descripcion'],
                    'fecha_inicio' => $coordData['fecha_inicio'],
                    'fecha_fin' => $coordData['fecha_fin'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                // Asignar rol correspondiente
                $this->assignRole($coordData['user_id'], $coordData['tipo'] === 'coordinador' ? $rolCoordinador->id : $rolAsistente->id);

                $this->command->info("Coordinador {$coordData['tipo']} creado para edición {$coordData['edicion_id']}");
            } else {
                $this->command->info("Coordinador ya existe para usuario {$coordData['user_id']} en edición {$coordData['edicion_id']}");
            }
        }

        $this->command->info('CoordNacionalSeeder completado exitosamente.');
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
