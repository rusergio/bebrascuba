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
        $this->call(CoordNacionalSeeder::class);
       
        //ELIMINAR para produccion.Usuarios de prueba. 
        //$this->call(TestUsersSeeder::class);

        //Recursos de las 3 ediciones realizadas
        $this->call(RecursoSeeder::class);

        // Debe ejecutarse antes que las migraciones 
        // que dependen de subsistema_escuela
        $this->call(SubsistemaSeeder::class); 
        $this->call(EscuelaVCexcelSeeder::class);

        //Insertar Profesores y sus escuelas de las 3 ediciones - 2022, 2023 y 2024

        $this->call(MaestrosEscuelasTodosSeeder::class);
        $this->command->ask('Presiona ENTER para continuar...');
        $this->command->newLine();

        //Insertar Estudiantes y sus escuelas de la edición 2022
        $this->call(E2022bEstudiantesSeeder::class);
        $this->command->ask('Presiona ENTER para continuar...');
        $this->command->newLine();

        //Insertar Estudiantes y sus escuelas de la edición 2023
        $this->call(E2023bEstudiantesSeeder::class);
        $this->command->ask('Presiona ENTER para continuar...');
        $this->command->newLine();

        //Insertar Estudiantes y sus escuelas de la edición 2024
        $this->call(E2024bEstudiantesSeeder::class);
        $this->command->ask('Presiona ENTER para continuar...');
        $this->command->newLine();

        //Insertar Coordinadores regionales de las 3 ediciones - 2022, 2023 y 2024
        //OJO SOLO DE EJEMPLO
        $this->call(CoordRegionalesSeeder::class);

        //para dejar ABIERTA LA edicion DEL 2025.
        $inicializar = $this->command->confirm('¿Inicializar EDICIÓN 4 (2025)? : ', false);
        if ($inicializar) {
	        $this->call(Edicion2025Seeder::class);
	        $this->command->info('EDICIÓN 4 inicializada.');
        } else {
	        $this->command->warn('Saltando EDICIÓN 4.');
        }
    }
}
