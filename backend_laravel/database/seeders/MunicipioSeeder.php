<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MunicipioSeeder extends Seeder
{
    /**
     * Run the database seeds
     *
     * @return void
     */
    public function run()
    {
        $municipios = [
           //municipios de Pinar del Rio id 21
            ['codigo' => 2101, 'nombre' => 'Sandino', 'cdgo_provincia' => 21],
            ['codigo' => 2102, 'nombre' => 'Mantua', 'cdgo_provincia' => 21],
            ['codigo' => 2103, 'nombre' => 'Minas de Matahambre', 'cdgo_provincia' => 21],
            ['codigo' => 2104, 'nombre' => 'Viñales', 'cdgo_provincia' => 21],
            ['codigo' => 2105, 'nombre' => 'La Palma', 'cdgo_provincia' => 21],
            ['codigo' => 2106, 'nombre' => 'Los Palacios', 'cdgo_provincia' => 21],
            ['codigo' => 2107, 'nombre' => 'Consolación del Sur', 'cdgo_provincia' => 21],
            ['codigo' => 2108, 'nombre' => 'Pinar del Río', 'cdgo_provincia' => 21],
            ['codigo' => 2109, 'nombre' => 'San Luis', 'cdgo_provincia' => 21],
            ['codigo' => 2110, 'nombre' => 'San Juan y Martínez', 'cdgo_provincia' => 21],
            ['codigo' => 2111, 'nombre' => 'Guane', 'cdgo_provincia' => 21],

           //municipios de Artemisa id 22
            ['codigo' => 2201, 'nombre' => 'Bahía Honda', 'cdgo_provincia' => 22],
            ['codigo' => 2202, 'nombre' => 'Mariel', 'cdgo_provincia' => 22],
            ['codigo' => 2203, 'nombre' => 'Guanajay', 'cdgo_provincia' => 22],
            ['codigo' => 2204, 'nombre' => 'Caimito', 'cdgo_provincia' => 22],
            ['codigo' => 2205, 'nombre' => 'Bauta', 'cdgo_provincia' => 22],
            ['codigo' => 2206, 'nombre' => 'San Antonio de los Baños', 'cdgo_provincia' => 22],
            ['codigo' => 2207, 'nombre' => 'Güira de Melena', 'cdgo_provincia' => 22],
            ['codigo' => 2208, 'nombre' => 'Alquízar', 'cdgo_provincia' => 22],
            ['codigo' => 2209, 'nombre' => 'Artemisa', 'cdgo_provincia' => 22],
            ['codigo' => 2210, 'nombre' => 'Candelaria', 'cdgo_provincia' => 22],
            ['codigo' => 2211, 'nombre' => 'San Cristóbal', 'cdgo_provincia' => 22],

           //municipios de Habana id 23
            ['codigo' => 2301, 'nombre' => 'Playa', 'cdgo_provincia' => 23],
            ['codigo' => 2302, 'nombre' => 'Plaza de la Revolución', 'cdgo_provincia' => 23],
            ['codigo' => 2303, 'nombre' => 'Centro Habana', 'cdgo_provincia' => 23],
            ['codigo' => 2304, 'nombre' => 'La Habana Vieja', 'cdgo_provincia' => 23],
            ['codigo' => 2305, 'nombre' => 'Regla', 'cdgo_provincia' => 23],
            ['codigo' => 2306, 'nombre' => 'La Habana del Este', 'cdgo_provincia' => 23],
            ['codigo' => 2307, 'nombre' => 'Guanabacoa', 'cdgo_provincia' => 23],
            ['codigo' => 2308, 'nombre' => 'San Miguel del Padrón', 'cdgo_provincia' => 23],
            ['codigo' => 2309, 'nombre' => 'Diez de Octubre', 'cdgo_provincia' => 23],
            ['codigo' => 2310, 'nombre' => 'Cerro', 'cdgo_provincia' => 23],
            ['codigo' => 2311, 'nombre' => 'Marianao', 'cdgo_provincia' => 23],
            ['codigo' => 2312, 'nombre' => 'La Lisa', 'cdgo_provincia' => 23],
            ['codigo' => 2313, 'nombre' => 'Boyeros', 'cdgo_provincia' => 23],
            ['codigo' => 2314, 'nombre' => 'Arroyo Naranjo', 'cdgo_provincia' => 23],
            ['codigo' => 2315, 'nombre' => 'Cotorro', 'cdgo_provincia' => 23],

           //municipios de Mayabeque id 24
            ['codigo' => 2401, 'nombre' => 'Bejucal', 'cdgo_provincia' => 24],
            ['codigo' => 2402, 'nombre' => 'San José de las Lajas', 'cdgo_provincia' => 24],
            ['codigo' => 2403, 'nombre' => 'Jaruco', 'cdgo_provincia' => 24],
            ['codigo' => 2404, 'nombre' => 'Santa Cruz del Norte', 'cdgo_provincia' => 24],
            ['codigo' => 2405, 'nombre' => 'Madruga', 'cdgo_provincia' => 24],
            ['codigo' => 2406, 'nombre' => 'Nueva Paz', 'cdgo_provincia' => 24],
            ['codigo' => 2407, 'nombre' => 'San Nicolás', 'cdgo_provincia' => 24],
            ['codigo' => 2408, 'nombre' => 'Güines', 'cdgo_provincia' => 24],
            ['codigo' => 2409, 'nombre' => 'Melena del Sur', 'cdgo_provincia' => 24],
            ['codigo' => 2410, 'nombre' => 'Batabanó', 'cdgo_provincia' => 24],
            ['codigo' => 2411, 'nombre' => 'Quivicán', 'cdgo_provincia' => 24],

           //municipios de Matanzas id 25
            ['codigo' => 2501, 'nombre' => 'Matanzas', 'cdgo_provincia' => 25],
            ['codigo' => 2502, 'nombre' => 'Cárdenas', 'cdgo_provincia' => 25],
            ['codigo' => 2503, 'nombre' => 'Martí', 'cdgo_provincia' => 25],
            ['codigo' => 2504, 'nombre' => 'Colón', 'cdgo_provincia' => 25],
            ['codigo' => 2505, 'nombre' => 'Perico', 'cdgo_provincia' => 25],
            ['codigo' => 2506, 'nombre' => 'Jovellanos', 'cdgo_provincia' => 25],
            ['codigo' => 2507, 'nombre' => 'Pedro Betancourt', 'cdgo_provincia' => 25],
            ['codigo' => 2508, 'nombre' => 'Limonar', 'cdgo_provincia' => 25],
            ['codigo' => 2509, 'nombre' => 'Unión de Reyes', 'cdgo_provincia' => 25],
            ['codigo' => 2510, 'nombre' => 'Ciénaga de Zapata', 'cdgo_provincia' => 25],
            ['codigo' => 2511, 'nombre' => 'Jagüey Grande', 'cdgo_provincia' => 25],
            ['codigo' => 2512, 'nombre' => 'Calimete', 'cdgo_provincia' => 25],
            ['codigo' => 2513, 'nombre' => 'Los Arabos', 'cdgo_provincia' => 25],

           //municipios de Villa Clara id 26
	        ['nombre' => 'Corralillo', 'codigo' => '2601', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Quemado de Güines', 'codigo' => '2602', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Sagua la Grande', 'codigo' => '2603', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Encrucijada', 'codigo' => '2604', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Camajuaní', 'codigo' => '2605', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Caibarién', 'codigo' => '2606', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Remedios', 'codigo' => '2607', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Placetas', 'codigo' => '2608', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Santa Clara', 'codigo' => '2609', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Cifuentes', 'codigo' => '2610', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Santo Domingo', 'codigo' => '2611', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Ranchuelo', 'codigo' => '2612', 'cdgo_provincia' => '26'],  
	        ['nombre' => 'Manicaragua', 'codigo' => '2613', 'cdgo_provincia' => '26'],  

           // Municipios de Cienfuegos
            ['nombre' => 'Aguada de Pasajeros', 'codigo' => '2701', 'cdgo_provincia' => 27],  
            ['nombre' => 'Rodas', 'codigo' => '2702', 'cdgo_provincia' => 27],  
            ['nombre' => 'Palmira', 'codigo' => '2703', 'cdgo_provincia' => 27],  
            ['nombre' => 'Lajas', 'codigo' => '2704', 'cdgo_provincia' => 27],  
            ['nombre' => 'Cruces', 'codigo' => '2705', 'cdgo_provincia' => 27],  
            ['nombre' => 'Cumanayagua', 'codigo' => '2706', 'cdgo_provincia' => 27],  
            ['nombre' => 'Abreus', 'codigo' => '2707', 'cdgo_provincia' => 27],  
            ['nombre' => 'Cienfuegos', 'codigo' => '2708', 'cdgo_provincia' => 27],  

           // Municipios de Sancti Spíritus
            ['nombre' => 'Yaguajay', 'codigo' => '2801', 'cdgo_provincia' => 28],  
            ['nombre' => 'Jatibonico', 'codigo' => '2802', 'cdgo_provincia' => 28],  
            ['nombre' => 'Taguasco', 'codigo' => '2803', 'cdgo_provincia' => 28],  
            ['nombre' => 'Cabaiguán', 'codigo' => '2804', 'cdgo_provincia' => 28],  
            ['nombre' => 'Fomento', 'codigo' => '2805', 'cdgo_provincia' => 28],  
            ['nombre' => 'Trinidad', 'codigo' => '2806', 'cdgo_provincia' => 28],  
            ['nombre' => 'Sancti Spíritus', 'codigo' => '2807', 'cdgo_provincia' => 28],  
            ['nombre' => 'La Sierpe', 'codigo' => '2808', 'cdgo_provincia' => 28],  

           // Municipios de Ciego de Ávila
            ['nombre' => 'Chambas', 'codigo' => '2901', 'cdgo_provincia' => 29],  
            ['nombre' => 'Morón', 'codigo' => '2902', 'cdgo_provincia' => 29],  
            ['nombre' => 'Bolivia', 'codigo' => '2903', 'cdgo_provincia' => 29],  
            ['nombre' => 'Primero de Enero', 'codigo' => '2904', 'cdgo_provincia' => 29],  
            ['nombre' => 'Ciro Redondo', 'codigo' => '2905', 'cdgo_provincia' => 29],  
            ['nombre' => 'Florencia', 'codigo' => '2906', 'cdgo_provincia' => 29],  
            ['nombre' => 'Majagua', 'codigo' => '2907', 'cdgo_provincia' => 29],  
            ['nombre' => 'Ciego de Avila', 'codigo' => '2908', 'cdgo_provincia' => 29],  
            ['nombre' => 'Venezuela', 'codigo' => '2909', 'cdgo_provincia' => 29],  
            ['nombre' => 'Baraguá', 'codigo' => '2910', 'cdgo_provincia' => 29],  
            
           // Municipios de Camagüey  
            ['nombre' => 'Carlos Manuel de Céspedes', 'codigo' => '3001', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Esmeralda', 'codigo' => '3002', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Sierra de Cubitas', 'codigo' => '3003', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Minas', 'codigo' => '3004', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Nuevitas', 'codigo' => '3005', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Guáimaro', 'codigo' => '3006', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Sibanicú', 'codigo' => '3007', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Camagüey', 'codigo' => '3008', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Florida', 'codigo' => '3009', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Vertientes', 'codigo' => '3010', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Jimaguayú', 'codigo' => '3011', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Najasa', 'codigo' => '3012', 'cdgo_provincia' => '30'],  
            ['nombre' => 'Santa Cruz del Sur', 'codigo' => '3013', 'cdgo_provincia' => '30'],  

           // Municipios de Las Tunas  
            ['nombre' => 'Manatí', 'codigo' => '3101', 'cdgo_provincia' => '31'],  
            ['nombre' => 'Puerto Padre', 'codigo' => '3102', 'cdgo_provincia' => '31'],  
            ['nombre' => 'Jesús Menéndez', 'codigo' => '3103', 'cdgo_provincia' => '31'],  
            ['nombre' => 'Majibacoa', 'codigo' => '3104', 'cdgo_provincia' => '31'],  
            ['nombre' => 'Las Tunas', 'codigo' => '3105', 'cdgo_provincia' => '31'],  
            ['nombre' => 'Jobabo', 'codigo' => '3106', 'cdgo_provincia' => '31'],  
            ['nombre' => 'Colombia', 'codigo' => '3107', 'cdgo_provincia' => '31'],  
            ['nombre' => 'Amancio', 'codigo' => '3108', 'cdgo_provincia' => '31'],  

           // Municipios de Holguín  
            ['nombre' => 'Gibara', 'codigo' => '3201', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Rafael Freyre', 'codigo' => '3202', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Banes', 'codigo' => '3203', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Antilla', 'codigo' => '3204', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Báguanos', 'codigo' => '3205', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Holguín', 'codigo' => '3206', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Calixto García', 'codigo' => '3207', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Cacocum', 'codigo' => '3208', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Urbano Noris', 'codigo' => '3209', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Cueto', 'codigo' => '3210', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Mayarí', 'codigo' => '3211', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Frank País', 'codigo' => '3212', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Sagua de Tánamo', 'codigo' => '3213', 'cdgo_provincia' => '32'],  
            ['nombre' => 'Moa', 'codigo' => '3214', 'cdgo_provincia' => '32'],  

           // Municipios de Granma  
            ['nombre' => 'Río Cauto', 'codigo' => '3301', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Cauto Cristo', 'codigo' => '3302', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Jiguaní', 'codigo' => '3303', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Bayamo', 'codigo' => '3304', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Yara', 'codigo' => '3305', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Manzanillo', 'codigo' => '3306', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Campechuela', 'codigo' => '3307', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Media Luna', 'codigo' => '3308', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Niquero', 'codigo' => '3309', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Pilón', 'codigo' => '3310', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Bartolomé Masó', 'codigo' => '3311', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Buey Arriba', 'codigo' => '3312', 'cdgo_provincia' => '33'],  
            ['nombre' => 'Guisa', 'codigo' => '3313', 'cdgo_provincia' => '33'],  

    // Municipios de Santiago de Cuba  
    ['nombre' => 'Contramaestre', 'codigo' => '3401', 'cdgo_provincia' => '34'],  
    ['nombre' => 'Mella', 'codigo' => '3402', 'cdgo_provincia' => '34'],  
    ['nombre' => 'San Luis', 'codigo' => '3403', 'cdgo_provincia' => '34'],  
    ['nombre' => 'Segundo Frente', 'codigo' => '3404', 'cdgo_provincia' => '34'],  
    ['nombre' => 'Songo - La Maya', 'codigo' => '3405', 'cdgo_provincia' => '34'],  
    ['nombre' => 'Santiago de Cuba', 'codigo' => '3406', 'cdgo_provincia' => '34'],   
    ['nombre' => 'Palma Soriano', 'codigo' => '3407', 'cdgo_provincia' => '34'],  
    ['nombre' => 'Tercer Frente', 'codigo' => '3408', 'cdgo_provincia' => '34'],  
    ['nombre' => 'Guamá', 'codigo' => '3409', 'cdgo_provincia' => '34'],  

    // Municipios de Guantánamo    
    ['nombre' => 'El Salvador', 'codigo' => '3501', 'cdgo_provincia' => '35'],  
    ['nombre' => 'Manuel Tames', 'codigo' => '3502', 'cdgo_provincia' => '35'],  
    ['nombre' => 'Yateras', 'codigo' => '3503', 'cdgo_provincia' => '35'],  
    ['nombre' => 'Baracoa', 'codigo' => '3504', 'cdgo_provincia' => '35'],  
    ['nombre' => 'Maisí', 'codigo' => '3505', 'cdgo_provincia' => '35'],  
    ['nombre' => 'Imías', 'codigo' => '3506', 'cdgo_provincia' => '35'],  
    ['nombre' => 'San Antonio del Sur', 'codigo' => '3507', 'cdgo_provincia' => '35'],  
    ['nombre' => 'Caimanera', 'codigo' => '3508', 'cdgo_provincia' => '35'],  
    ['nombre' => 'Guantánamo', 'codigo' => '3509', 'cdgo_provincia' => '35'],   
    ['nombre' => 'Niceto Pérez', 'codigo' => '3510', 'cdgo_provincia' => '35'],  

    // Municipios de Isla de la Juventud  
    ['nombre' => 'Isla de la Juventud', 'codigo' => '4001', 'cdgo_provincia' => '40']  
];
    
    foreach ($municipios as $municipio) { 
        DB::table('municipios')->insert($municipio);
    }
}
}