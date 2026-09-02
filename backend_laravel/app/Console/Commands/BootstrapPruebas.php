<?php

namespace App\Console\Commands;

use Database\Seeders\BootstrapPruebasSeeder;
use Illuminate\Console\Command;

class BootstrapPruebas extends Command
{
    protected $signature = 'bebras:bootstrap-pruebas';

    protected $description = 'Carga ediciones, resultados, recursos demo y admin para pruebas locales';

    public function handle(): int
    {
        $this->call('migrate', ['--force' => true]);
        $this->call('db:seed', ['--class' => BootstrapPruebasSeeder::class, '--force' => true]);

        return self::SUCCESS;
    }
}
