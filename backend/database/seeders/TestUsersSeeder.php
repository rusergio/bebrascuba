<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Rol;
use App\Models\RoleUser;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * @return void
     */
    
    public function run()
    {
        // Primero asegurarse de que existan los roles necesarios
        $this->createRolesIfNotExist();
        // Crear usuarios de prueba
        $this->createAdminUser();
        $this->createCoordNacionalUser();
        $this->createCoordProvincialUser();
        $this->createCoordMunicipalUser();
        $this->createProfesoresUsers();
    }

    private function createRolesIfNotExist()
    {
        // Los roles ya se crean en RolSeeder, solo verificamos que existan
        $requiredRoles = [
            'Administrador',
            'Coordinador Nacional', 
            'Coordinador Provincial MINED', 
            'Coordinador Municipal MINED',
            'Profesor'
        ];

        foreach ($requiredRoles as $roleName) {
            $role = Rol::where('rol', $roleName)->first();
            if (!$role) {
                $this->command->warn("Rol '$roleName' no encontrado. Asegúrate de que RolSeeder se ejecute primero.");
            }
        }
    }

    private function createAdminUser()
    {
        $user = User::firstOrCreate(
            ['correo' => 'admin@bebrascuba.cu'],
            [
                'nro_ci' => '12345678',
                'nombre' => 'Administrador',
                'apellidos' => 'Sistema',
                'correo' => 'admin@bebrascuba.cu',
                'telefono' => '5351234567',
                'contrasenia' => 'admin123', // Se hashea automáticamente
                'pin' => '1234',             // Se hashea automáticamente
                'foto_perfil' => null,
            ]
        );

        // Asignar rol de administrador
        $this->assignRole($user->id, 'Administrador');
        
        $this->command->info('Usuario Administrador creado: admin@bebrascuba.cu / admin123');
    }

    private function createCoordNacionalUser()
    {
        $user = User::firstOrCreate(
            ['correo' => 'coord.nacional@bebrascuba.cu'],
            [
                'nro_ci' => '23456789',
                'nombre' => 'Carlos',
                'apellidos' => 'Rodríguez',
                'correo' => 'coord.nacional@bebrascuba.cu',
                'telefono' => '5352345678',
                'contrasenia' => 'coord123', // Se hashea automáticamente
                'pin' => '2345', // Se hashea automáticamente
                'foto_perfil' => null,
            ]
        );

        // Asignar rol de coordinador nacional
        $this->assignRole($user->id, 'Coordinador Nacional');
        
        $this->command->info('Usuario Coordinador Nacional creado: coord.nacional@bebrascuba.cu / coord123');
    }

    private function createCoordProvincialUser()
    {
        $user = User::firstOrCreate(
            ['correo' => 'coord.villaclara@bebrascuba.cu'],
            [
                'nro_ci' => '34567890',
                'nombre' => 'María',
                'apellidos' => 'González',
                'correo' => 'coord.villaclara@bebrascuba.cu',
                'telefono' => '5353456789',
                'contrasenia' => 'villaclara123', // Se hashea automáticamente
                'pin' => '3456', // Se hashea automáticamente
                'foto_perfil' => null,
            ]
        );

        // Asignar rol de coordinador provincial
        $this->assignRole($user->id, 'Coordinador Provincial MINED'); // Usar el nombre exacto del RolSeeder
        
        $this->command->info('Usuario Coordinador Provincial Villa Clara creado: coord.villaclara@bebrascuba.cu / villaclara123');
    }

    private function createCoordMunicipalUser()
    {
        $user = User::firstOrCreate(
            ['correo' => 'coord.santaclara@bebrascuba.cu'],
            [
                'nro_ci' => '45678901',
                'nombre' => 'Ana',
                'apellidos' => 'López',
                'correo' => 'coord.santaclara@bebrascuba.cu',
                'telefono' => '5354567890',
                'contrasenia' => 'santaclara123', // Se hashea automáticamente
                'pin' => '4567', // Se hashea automáticamente
                'foto_perfil' => null,
            ]
        );

        // Asignar rol de coordinador municipal
        $this->assignRole($user->id, 'Coordinador Municipal MINED');
        
        $this->command->info('Usuario Coordinador Municipal Santa Clara creado: coord.santaclara@bebrascuba.cu / santaclara123');
    }

    private function createProfesoresUsers()
    {
        $profesores = [
            [
                'correo' => 'profesor1@bebrascuba.cu',
                'nro_ci' => '56789012',
                'nombre' => 'Roberto',
                'apellidos' => 'Martínez',
                'telefono' => '5355678901',
                'pin' => '5678'
            ],
            [
                'correo' => 'profesor2@bebrascuba.cu',
                'nro_ci' => '67890123',
                'nombre' => 'Isabel',
                'apellidos' => 'Fernández',
                'telefono' => '5356789012',
                'pin' => '6789'
            ],
            [
                'correo' => 'profesor3@bebrascuba.cu',
                'nro_ci' => '78901234',
                'nombre' => 'Pedro',
                'apellidos' => 'Hernández',
                'telefono' => '5357890123',
                'pin' => '7890'
            ],
            [
                'correo' => 'profesor4@bebrascuba.cu',
                'nro_ci' => '89012345',
                'nombre' => 'Carmen',
                'apellidos' => 'Díaz',
                'telefono' => '5358901234',
                'pin' => '8901'
            ],
            [
                'correo' => 'profesor5@bebrascuba.cu',
                'nro_ci' => '90123456',
                'nombre' => 'Luis',
                'apellidos' => 'Pérez',
                'telefono' => '5359012345',
                'pin' => '9012'
            ]
        ];

        foreach ($profesores as $index => $profesor) {
            $user = User::firstOrCreate(
                ['correo' => $profesor['correo']],
                [
                    'nro_ci' => $profesor['nro_ci'],
                    'nombre' => $profesor['nombre'],
                    'apellidos' => $profesor['apellidos'],
                    'correo' => $profesor['correo'],
                    'telefono' => $profesor['telefono'],
                    'contrasenia' => 'profesor123', // Se hashea automáticamente
                    'pin' => $profesor['pin'], // Se hashea automáticamente
                    'foto_perfil' => null,
                ]
            );

            // Asignar rol de profesor
            $this->assignRole($user->id, 'Profesor');
            
            $this->command->info("Profesor " . ($index + 1) . " creado: " . $profesor['correo'] . " / profesor123");
        }
    }

    private function assignRole($userId, $roleName)
    {
        $role = Rol::where('rol', $roleName)->first();
        
        if (!$role) {
            $this->command->error("Rol '$roleName' no encontrado para el usuario ID $userId");
            return;
        }

        // Verificar si ya existe la asignación
        $exists = RoleUser::where('user_id', $userId)
            ->where('rol_id', $role->id)
            ->exists();

        if (!$exists) {
            try {
                RoleUser::create([
                    'user_id' => $userId,
                    'rol_id' => $role->id
                ]);
                $this->command->info("Rol '$roleName' asignado correctamente al usuario ID $userId");
            } catch (\Exception $e) {
                $this->command->error("Error al asignar rol '$roleName' al usuario ID $userId: " . $e->getMessage());
            }
        } else {
            $this->command->info("El usuario ID $userId ya tiene el rol '$roleName'");
        }
    }
}
