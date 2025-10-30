<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CarreraSeeder extends Seeder
{
    private $carreras = [
   //'Universidad de Pinar del Río Hermanos Saiz Montes de Oca' ==>> 1
   // Carrera | Universidad
   ['Ingeniería Informática', 1],
   ['Agronomia', 1],
   ['Licenciatura en Economía', 1],
   ['Ingeniería Forestal', 1],
   ['Ingeniería Geológica', 1],
   ['Licenciatura en Contabilidad y Finanzas', 1],
   ['Ingeniería Informática', 1],
   ['Licenciatura en Educación Especial', 1],
   ['Licenciatura en Educación Preescolar', 1],
   ['Licenciatura en Educación Logopedia', 1],
   ['Licenciatura en Educación Pedagogía-sicología', 1],
   ['Licenciatura en Cultura física', 1],
   ['Ingeniería Mecánica', 1],
   ['Licenciatura en Educación Español Literatura', 1],
   ['Licenciatura en Educación Primaria', 1],
   ['Ingeniería en Telecomunicaciones y Electrónica', 1],
   ['Licenciatura en Gestión sociocultural para el desarrollo', 1],
   ['Agronomía de Montaña', 1],
   ['Licenciatura en Derecho', 1],
   ['Licenciatura en Educación en Lenguas Extranjeras. Inglés', 1],
   ['Licenciatura en Educación Marxismo e Historia', 1],
   //'Universidad de Artemisa Julio Díaz González' ==>> 2
   //'Universidad de La Habana' ==>> 3
  ['Licenciatura en Historia',3],
  ['Licenciatura en Contabilidad y Finanzas',3],
  ['Licenciatura en Psicología',3],
  ['Licenciatura en Derecho',3],
  ['Licenciatura en Letras',3],
  ['Licenciatura en Matemática',3],
  ['Licenciatura en Historia del Arte',3],
  ['Licenciatura en Filosofía',3],
  ['Licenciatura en Geografía',3],
  ['Licenciatura en Biología',3],
  ['Licenciatura en Bioquímica y Biología Molecular',3],
  ['Licenciatura en Microbiología y virología',3],
  ['Licenciatura en Ciencias Farmacéuticas',3],
  ['Licenciatura en Ciencias Alimentarias',3],
  ['Licenciatura en Sociología',3],
  ['Licenciatura en Ciencias de la Información',3],
  ['Licenciatura en Ciencias de la Computación',3],
  ['Licenciatura en Economía',3],
  ['Licenciatura en Química',3],
  ['Licenciatura en Periodismo',3],
  ['Licenciatura en Comunicación Social',3],
  ['Licenciatura Física',3],
  ['Licenciatura en Física Nuclear',3],
  ['Ingeniería en Tecnologías Nucleares y Energéticas',3],
  ['Licenciatura en Meteorología',3],
  ['Licenciatura en Lengua Alemana (con segunda lengua extranjera)',3],
  ['Licenciatura en Lengua Francesa(con segunda lengua extranjera)',3],
  ['Licenciatura en Lengua Inglesa (con segunda lengua extranjera)',3],
  ['Licenciatura en Lengua Rusa (con segunda lengua extranjera)',3],
  ['Licenciatura en Turismo',3],
  ['Licenciatura en Radioquímica',3],
  ['Diseño de Comunicación Visual',3],
  ['Diseño Industrial',3],

   //'Universidad Tecnológica de La Habana José Antonio Echeverría' ==>> 4
   ['Ingeniería Química',4],
   ['Ingeniería Mecánica',4],
   ['Ingeniería Informática',4],
   ['Ingeniería Industrial',4],
   ['Ingeniería Hidráulica',4],
   ['Ingeniería en Telecomunicaciones y Electrónica',4],
   ['Ingeniería Eléctrica',4],
   ['Ingeniería Biomédica',4],
   ['Ingeniería Automática',4],
   ['Arquitectura y Urbanismo',4],
   ['Ingeniería Civil',4],
   ['Ingeniería en Metalurgia y Materiales',4],
   ['Ingenieria Geofísica',4],

   //'Universidad de Ciencias Pedagógicas Enrique José Varona' ==>> 5
   ['Licenciatura en Educación Especial',5],
   ['Licenciatura en Educación Logopedia',5],
   ['Licenciatura en Educación Pedagogía-Sicología',5],
   ['Licenciatura en Educación Marxismo-leninismo e Historia',5],
   ['Licenciatura en Educación Lengua Extranjera',5],
   ['Licenciatura en Educación Español-Literatura',5],

   //'Universidad de las Ciencias de la Cultura Física y el Deporte Manuel Fajardo' ==>> 6
   ['Licenciatura en Cultura Física', 6],
    
   //'Universidad Agraria de La Habana Fructuoso Rodríguez Pérez' ==>> 7
   ['Agronomía', 7],
   ['Medicina Veterinaria y Zootecnia', 7],
   ['Ingeniería Agrícola', 7],
   ['Ingeniería Informática', 7],
   ['Licenciatura en Contabilidad y Finanzas', 7],
   ['Ingeniería Industrial', 7],
   ['Licenciatura en Gestión Sociocultural para el desarrollo', 7],

   //'Universidad de las Ciencias Informáticas' ==>> 8
   ['Ingeniería en Ciencias Informáticas', 8],
   
   //'Universidad de Matanzas' ==>> 9
   ['Agronomía', 9],
   ['Medicina Veterinaria y Zootecnia', 9],
   ['Ingeniería Agrícola', 9],
   ['Ingeniería Informática', 9],
   ['Licenciatura en Contabilidad y Finanzas', 9],
   ['Ingeniería Industrial', 9],
   ['Licenciatura en Gestión Sociocultural para el desarrollo', 9],
   
   //'Universidad Central "Marta Abreu" de Las Villas' ==>> 10
   ['Licenciatura en Química', 10],
   ['Licenciatura en Derecho', 10],
   ['Medicina Veterinaria y Zootecnia', 10],
   ['Ingeniería Civil', 10],
   ['Licenciatura en Psicología', 10],
   ['Ciencias de la Computación', 10],
   ['Agronomía', 10],
   ['Ingeniería Química', 10],
   ['Ingeniería Mecánica', 10],
   ['Licenciatura en Sociología', 10],
   ['Ingeniería Informática', 10],
   ['Licenciatura en Biología', 10],
   ['Ingeniería Eléctrica', 10],
   ['Ingeniería Automática', 10],
   ['Ingeniería en Telecomunicaciones y Electrónica', 10],
   ['Licenciatura en Economía', 10],
   ['Licenciatura en Contabilidad y Finanzas', 10],
   ['Licenciatura en Ciencias Farmacéuticas', 10],
   ['Licenciatura en Lengua Inglesa (con segunda lengua extranjera)', 10],
   ['Ingeniería Industrial', 10],
   ['Arquitectura y Urbanismo', 10],
   ['Licenciatura en Letras', 10],
   ['Licenciatura en Matemática', 10],
   ['Licenciatura en Periodismo', 10],
   ['Licenciatura en Comunicación social', 10],
   ['Licenciatura en Turismo', 10],
   ['Ingeniería Agrícola', 10],
   ['Licenciatura en Cultura Física', 10],
   ['Licenciatura en Física', 10],
   ['Licenciatura en Educación Logopedia', 10],
   ['Licenciatura en Educación Lengua Extranjera', 10],
   ['Licenciatura en Educación Preescolar', 10],
   ['Licenciatura en Educación Pedagogía-Psicología', 10],
   ['Licenciatura en Gestión Sociocultural para el desarrollo', 10],
   ['Licenciatura en Ciencias de la Información', 10],
   ['Licenciatura en Filosofía', 10],
   ['Ingeniería Hidráulica', 10],

   //'Universidad de Cienfuegos Carlos Rafael Rodríguez' ==>> 11
   ['Ingeniería Industrial', 11],
   ['Licenciatura en Economía', 11],
   ['Licenciatura en Gestión sociocultural para el desarrollo', 11],
   ['Ingeniería Mecánica', 11],
   ['Licenciatura en Educación Pedagogía-Psicología', 11],
   ['Licenciatura en Contabilidad y Finanzas', 11],
   ['Agronomía', 11],
   ['Licenciatura en Cultura Física', 11],
   ['Licenciatura en Educación Logopedia', 11],
   ['Ingeniería Informática', 11],
   ['Licenciatura en Derecho', 11],

   //'Universidad de Sancti Spíritus José Martí Pérez' ==>> 12
   ['Licenciatura en Educación Logopedia', 12],
   ['Licenciatura en Educación Pedagogía Psicología', 12],
   ['Ingeniería Informática', 12],
   ['Agronomía', 12],
   ['Licenciatura en Contabilidad y Finanzas', 12],
   ['Licenciatura en Educación Lengua extranjera', 12],
   ['Licenciatura en Derecho', 12],
   ['Licenciatura en Cultura Física', 12],

   //'Universidad de Ciego de Ávila Máximo Gómez Báez' ==>> 13
   ['Ingeniería Informática', 13],
   ['Licenciatura en Contabilidad y Finanzas', 13],
   ['Agronomía', 13],
   ['Licenciatura en Educación Pedagogía Psicología', 13],
   ['Ingeniería Hidráulica', 13],
   ['Licenciatura en Turismo', 13],
   ['Licenciatura en Cultura Física', 13],

   //'Universidad de Camagüey Ignacio Agramonte Loynaz' ==>> 14
   ['Licenciatura en Contabilidad y Finanzas', 14],
   ['Ingeniería Química', 14],
   ['Medicina Veterinaria y Zootecnia', 14],
   ['Arquitectura y Urbanismo', 14],
   ['Licenciatura en Economía', 14],
   ['Ingeniería Mecánica', 14],
   ['Ingeniería Informática', 14],
   ['Licentura en Ciencias Alimentarias', 14],
   ['Licenciatura en Educación Logopedia', 14],
   ['Licenciatura en Cultura Física', 14],
   ['Licenciatura en Educación Lengua Extranjera Ingles', 14],
   ['Ingeniería Eléctrica', 14],
   ['Licenciatura en Ciencias de la Información', 14],
   ['Licenciatura en Derecho', 14],
   ['Ingeniería Civil', 14],
   ['Licenciatura en Historia', 14],
   ['Licenciatura en Educación Pedagogía-Psicología', 14],
   ['Licenciatura en Gestión sociocultural para el desarrollo', 14],
   ['Agronomía', 14],
   ['Licenciatura en Periodismo', 14],
   ['Licenciatura en Lengua Inglesa con segunda lengua Francés', 14],

   //'Universidad Vladímir Ilich Lenin de Las Tunas' ==>> 15
   ['Agronomía', 15],
   ['Licenciatura en Educación Pedagogía Psicología', 15],
   ['Licenciatura en Cultura Física', 15],
   ['Licenciatura en Gestión Sociocultural para el desarrollo', 15],
   ['Licenciatura en Educación Logopedia', 15],
   ['Licenciatura en Comunicación social', 15],
   ['Licenciatura en Contabilidad y finanzas', 15],

   //'Universidad de Holguín Oscar Lucero Moya' ==>> 16
   ['Ingeniería Industrial', 16],
   ['Licenciatura en Turismo', 16],
   ['Licenciatura en Educación Pedagogía-Psicología', 16],
   ['Licenciatura en Educación Logopedia', 16],
   ['Licenciatura en Matemática', 16],
   ['Licenciatura en Cultura Física', 16],
   ['Licenciatura en Lengua Inglesa (con segunda Lengua Extranjera )', 16],
   ['Ingeniería Informática', 16],
   ['Ingeniería Mecánica', 16],
   ['Licenciatura en Gestión sociocultural para el desarrollo', 16],
   ['Licenciatura en Historia', 16],
   ['Licenciatura en Educación Lengua Extranjera', 16],
   ['Licenciatura en Periodismo', 16],
   ['Agronomía', 16],
   ['Licenciatura en Derecho', 16],
   ['Licenciatura en Educación Español-Literatura', 16],
   ['Licenciatura en Educación Marxismo-Leninismo e Historia', 16],
   ['Ingeniería Civil', 16],
   ['Licenciatura en Economía', 16],
   ['Licenciatura en Contabilidad y Finanzas', 16],

   //'Universidad de Moa Dr. Núñez Jiménez' ==>> 17
   ['Ingeniería en Metalurgia y Materiales', 17],
   ['Ingeniería Mecánica', 17],
   ['Ingeniería Eléctrica', 17],
   ['Ingeniería en Minas', 17],
   ['Ingeniería Geológica', 17],

   //'Universidad de Granma' ==>> 18
   ['Medicina Veterinaria y Zootecnia', 18],
   ['Agronomía', 18],
   ['Licenciatura en Gestión sociocultural para el desarrollo', 18],
   ['Ingeniería Agrícola', 18],
   ['Licenciatura en Contabilidad y Finanzas', 18],
   ['Ingeniería Forestal', 18],
   ['Ingeniería Mecánica', 18],
   ['Licenciatura en Derecho', 18],
   ['Licenciatura en Educación Español-Literatura', 18],
   ['Licenciatura en Cultura Física', 18],
   ['Licenciatura en Educación Marxismo e Historia', 18],
   ['Licenciatura en Economía', 18],
   ['Licenciatura en Educación Pedagogía-Psicología', 18],
   ['Licenciatura en Educación Lengua Extranjera', 18],
   ['Ingeniería Informática', 18],

   //'Universidad de Oriente' ==>> 19
   ['Licenciatura en Historia del Arte', 19],
   ['Licenciatura en Letras', 19],
   ['Licenciatura en Historia', 19],
   ['Arquitectura y Urbanismo', 19],
   ['Licenciatura en Filosofía', 19],
   ['Licenciatura en Química', 19],
   ['Licenciatura en Biología', 19],
   ['Ingeniería Química', 19],
   ['Licenciatura en Derecho', 19],
   ['Licenciatura en Economía', 19],
   ['Licenciatura en Física', 19],
   ['Licenciatura en Psicología', 19],
   ['Licenciatura en Ciencias Farmacéuticas', 19],
   ['Licenciatura en Educación Pedagogía-Psicología', 19],
   ['Licenciatura en Educación Primaria', 19],
   ['Ingeniería Civil', 19],
   ['Licenciatura en Sociología', 19],
   ['Licenciatura en Contabilidad y Finanzas', 19],
   ['Ingeniería en Telecomunicaciones y Electrónica', 19],
   ['Ingeniería Mecánica', 19],
   ['Ingeniería Automática', 19],
   ['Licenciatura en Matemática', 19],
   ['Licenciatura en Lengua Inglesa (con segunda Lengua extranjera)', 19],
   ['Licenciatura en Periodismo', 19],
   ['Ingeniería Hidráulica', 19],
   ['Licenciatura en Comunicación Social', 19],
   ['Licenciatura en Educación Especial', 19],
   ['Licenciatura en Educación Preescolar', 19],
   ['Licenciatura en Educación Logopedia', 19],
   ['Licenciatura en Educación Lengua Extranjera', 19],
   ['Licenciatura en Educación Marxismo e Historia', 19],
   ['Ingeniería Eléctrica', 19],
   ['Agronomía', 19],
   ['Licenciatura en Ciencias de la Computación', 19],
   ['Licenciatura en Educación Español-Literatura', 19],
   ['Licenciatura en Cultura Física', 19],
   ['Ingeniería Biomédica', 19],
   ['Ingeniería Informática', 19],

   //'Universidad de Guantánamo' ==>> 20
   ['Agronomía', 20],
   ['Ingeniería Forestal', 20],
   ['Licenciatura en Cultura Física', 20],
   ['Licenciatura en Educación Logopedia', 20],
   ['Licenciatura en Educación Marxismo e Historia', 20],
   ['Licenciatura en Educación Pedagogía-Psicología', 20],
   ['Licenciatura en Contabilidad y Finanzas', 20],
   ['Licenciatura en Educación Español-Literatura', 20],
   ['Licenciatura en Derecho', 20],
   ['Licenciatura en Educación Lengua Extranjera', 20],

   //'Universidad de la Isla de la Juventud Jesús Montané Oropesa' ==>> 21
   //'Universidad de las Artes' ==>> 22
   //'Universidad de Ciencias Médicas de Pinar del Río' ==>> 23
    ['Medicina', 23],
    ['Estomatología', 23],

   //'Universidad de Ciencias Médicas de La Habana' ==>> 24
   ['Medicina Facultad “Victoria Girón”', 24],
   ['Medicina Facultad “Comandante Manuel Fajardo”', 24],
   ['Estomatología Facultad “Raúl González”', 24],
   ['Medicina Facultad “Calixto García”', 24],
   ['Medicina Facultad “Enrique Cabrera”', 24],
   ['Medicina Facultad “Finlay-Albarrán”', 24],
   ['Medicina Facultad “Salvador Allende”', 24],
   ['Licenciatura en Enfermería Facultad “Calixto García”', 24],
   ['Medicina Facultad “Miguel Enríquez”', 24],
   ['Medicina Facultad “Julio Trigo”', 24],
   ['Medicina Facultad “10 Octubre”', 24],
   ['Estomatología Facultad “Victoria de Girón”', 24],

   //'Escuela Latinoamericana de Medicina' ==>> 25
   ['Medicina', 25],

   //'Universidad de Ciencias Médicas de Matanzas' ==>> 26
   ['Estomatología', 26],
   ['Medicina', 26],

   //'Universidad de Ciencias Médicas de Villa Clara' ==>> 27
   ['Estomatología', 27],
   ['Medicina', 27],

   //'Universidad de Ciencias Médicas de Cienfuegos' ==>> 28
   ['Estomatología', 28],
   ['Medicina', 28],
   ['Licenciatura en Enfermería', 28],

   //'Universidad de Ciencias Médicas de Sancti Spíritus' ==>> 29
   ['Estomatología', 29],
   ['Medicina', 29],

   //'Universidad de Ciencias Médicas de Ciego de Ávila' ==>> 30
   ['Estomatología', 30],
   ['Medicina', 30],

   //'Universidad de Ciencias Médicas de Camagüey' ==>> 31
   //'Universidad de Ciencias Médicas de Las Tunas' ==>> 32
   //'Universidad de Ciencias Médicas de Holguín' ==>> 33
   //'Universidad de Ciencias Médicas de Granma' ==>> 34
   ['Estomatología', 34],

   //'Universidad de Ciencias Médicas de Santiago de Cuba' ==>> 35
   ['Estomatología', 35],
   ['Medicina Facultad 1', 35],
   ['Medicina Facultad 2', 35],
   ['Licenciatura en Enfermería', 35],

   //'Universidad de Ciencias Médicas de Guantánamo' ==>> 36
   ['Medicina', 36],
   ['Estomatología', 36],
       
    ];

    public function run()
    {
        $carrerasData = [];
        foreach ($this->carreras as $carrera) {
            [$nombreCarrera, $universidadId] = $carrera;
            
            $carrerasData[] = [
                'nombre' => $nombreCarrera,
                'universidad_id' => $universidadId,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        DB::table('carreras')->insert($carrerasData);
    }
} 