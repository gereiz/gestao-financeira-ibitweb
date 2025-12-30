<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

use Illuminate\Support\Facades\View;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        try {
            // Verifica se a tabela existe antes de consultar
            // Envolvemos em try-catch para garantir que não quebre em ambiente sem DB configurado (instalação)
            if (Schema::hasTable('system_settings')) {
                $settings = SystemSetting::all()->pluck('value', 'key')->toArray();
                View::share('system_settings', $settings);
            }
        } catch (\Exception $e) {
            // Silencia erro de conexão para permitir que o instalador rode
        }
    }
}
