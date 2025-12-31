<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class CheckDatabaseConnection
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Se estiver acessando rotas de instalação, permite (para evitar loop)
        if ($request->is('install*')) {
            return $next($request);
        }

        // Se o arquivo de instalação já existe, assume que está tudo ok
        if (file_exists(storage_path('installed'))) {
            return $next($request);
        }

        try {
            DB::connection()->getPdo();
            
            // Se conectou, verifica se as tabelas principais existem
            if (Schema::hasTable('users') && Schema::hasTable('migrations')) {
                // Se existem, marca como instalado para evitar checks futuros
                touch(storage_path('installed'));
                return $next($request);
            }

            // Se conectou mas não tem tabelas, redireciona para instalação
            return redirect()->route('install.index');

        } catch (\Exception $e) {
            // Se falhar a conexão, redireciona para instalação
            return redirect()->route('install.index');
        }
    }
}
