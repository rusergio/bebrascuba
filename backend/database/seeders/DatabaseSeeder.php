<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ProvinciaSeeder::class);
        $this->call(MunicipioSeeder::class);
        
        $this->call(RolSeeder::class);
        
        $this->call(CategoriaSeeder::class);
        $this->call(EdicionesSeeder::class);
        $this->call(EdicionCategoriaSeeder::class);

        $this->call(ResultadoProvinciaSeeder::class);

        //Usuario administrador principal
        $this->call(AdminUserSeeder::class);
        //Coordinadores Nacionales de las 3 ediciones realizadas
        // $this->call(CoordNacionalSeeder::class);
       
        //ELIMINAR para produccion.Usuarios de prueba. 
        $this->call(TestUsersSeeder::class);

        //Recursos de las 3 ediciones realizadas
        $this->call(RecursoSeeder::class);

        // Debe ejecutarse antes que las migraciones 
        // que dependen de subsistema_escuela
        $this->call(SubsistemaSeeder::class); 
        $this->call(EscuelaVCexcelSeeder::class);

        //Insertar Profesores y sus escuelas de las 3 ediciones - 2022, 2023 y 2024
        $this->call(MaestrosEscuelasTodosSeeder::class);
        
        //Insertar Estudiantes y sus escuelas de la edición 2022
        $this->call(E2022BEstudiantesSeeder::class);
        //Insertar Estudiantes y sus escuelas de la edición 2023
        //$this->call(E2023EstudiantesSeeder::class);
        //Insertar Estudiantes y sus escuelas de la edición 2024
        //$this->call(E2024EstudiantesSeeder::class);


    }
}
