<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        // Isso evita testar a conexão com o banco em toda requisição (performance)
        if (file_exists(storage_path('installed'))) {
            return $next($request);
        }

        // Se não existe o arquivo, tenta conectar
        try {
            DB::connection()->getPdo();
            
            // Se conectou com sucesso, cria o arquivo para não checar mais
            touch(storage_path('installed'));
            
            return $next($request);
        } catch (\Exception $e) {
            // Se falhar a conexão, redireciona para instalação
            return redirect()->route('install.index');
        }
    }
}
