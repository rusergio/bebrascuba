<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //Crear el Administrador del sitio web BebrasCuba
        $useradmin = [
            'nro_ci' => '11111111111',
            'nombre' => 'Admin',
            'apellidos' => 'Bebras Cuba',
            'correo' => 'bebrascuba@uclv.cu',
            'telefono' => '52488305',
            'contrasenia' => 'bebrascuba',
            'pin' => '1111',
        ];
        //verificar si esta el correo bebrascuba@uclv.cu registrado
        $user = DB::table('users')->where('correo', 'bebrascuba@uclv.cu')->first();
        
        //obtener el id del rol Administrador
        $adminRole = DB::table('roles')->where('rol', 'Administrador')->first();
        
        if ($user) {
            echo "El correo bebrascuba@uclv.cu ya esta registrado.";
            echo "NO se procede a crear el usuario Administrador.";
            return;
        } 
        if (!$adminRole) {
            echo "El rol Administrador no esta registrado.";
            echo "NO se procede a crear el usuario Administrador.";
            return;
        }
        //Insertar el usuario Administrador
        $userId = DB::table('users')->insertGetId([
            'nombre' => $useradmin['nombre'],
            'apellidos' => $useradmin['apellidos'],
            'correo' => $useradmin['correo'],
            'nro_ci' => $useradmin['nro_ci'],
            'telefono' => $useradmin['telefono'],
            'contrasenia' => Hash::make($useradmin['contrasenia']),
            'pin' => Hash::make($useradmin['pin']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        if ($userId && $adminRole) {
            DB::table('role_user')->insert([
                'user_id' => $userId,
                'rol_id' => $adminRole->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            echo "Usuario Administrador creado correctamente.";
        } else {
            echo "NO se pudo crear el usuario Administrador.";
        }
    }
}
