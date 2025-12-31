<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InstallController extends Controller
{
    public function index()
    {
        // Se já estiver instalado, redireciona
        if (file_exists(storage_path('installed'))) {
            return redirect('/');
        }

        return Inertia::render('Install/Index', [
            'db_config' => [
                'host' => config('database.connections.mysql.host') ?? '127.0.0.1',
                'port' => config('database.connections.mysql.port') ?? '3306',
                'database' => config('database.connections.mysql.database') ?? 'laravel',
                'username' => config('database.connections.mysql.username') ?? 'root',
                'password' => '', // Por segurança não preenchemos a senha
            ]
        ]);
    }

    public function testConnection(Request $request)
    {
        $data = $request->validate([
            'host' => 'required',
            'port' => 'required',
            'database' => 'required',
            'username' => 'required',
            'password' => 'nullable',
        ]);

        try {
            // Configurar conexão temporária
            Config::set('database.connections.temp_install', [
                'driver' => 'mysql',
                'host' => $data['host'],
                'port' => $data['port'],
                'database' => $data['database'],
                'username' => $data['username'],
                'password' => $data['password'],
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
                'strict' => true,
                'engine' => null,
            ]);

            DB::connection('temp_install')->getPdo();

            // Verificar se existem tabelas
            $hasTables = count(DB::connection('temp_install')->select('SHOW TABLES')) > 0;

            return response()->json([
                'message' => 'Conexão realizada com sucesso!' . ($hasTables ? ' Tabelas existentes detectadas.' : ''),
                'status' => 'success',
                'has_tables' => $hasTables
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao conectar: ' . $e->getMessage(), 'status' => 'error'], 400);
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'host' => 'required',
            'port' => 'required',
            'database' => 'required',
            'username' => 'required',
            'password' => 'nullable',
            'install_mode' => 'nullable|in:fresh,keep',
        ]);

        try {
            // 1. Atualizar .env
            $this->updateEnv([
                'DB_HOST' => $request->host,
                'DB_PORT' => $request->port,
                'DB_DATABASE' => $request->database,
                'DB_USERNAME' => $request->username,
                'DB_PASSWORD' => $request->password,
            ]);

            // 2. Limpar cache de configuração para recarregar valores
            Artisan::call('config:clear');
            
            // Força o Laravel a reler as variáveis de ambiente para a conexão atual
            // Nota: Isso pode não funcionar perfeitamente em um único request, mas vamos tentar
            // reconfigurar a conexão default em tempo de execução para rodar as migrations
            Config::set('database.connections.mysql.host', $request->host);
            Config::set('database.connections.mysql.port', $request->port);
            Config::set('database.connections.mysql.database', $request->database);
            Config::set('database.connections.mysql.username', $request->username);
            Config::set('database.connections.mysql.password', $request->password);
            DB::purge('mysql');
            DB::reconnect('mysql');

            // 3. Rodar Migrations e Seeders
            $installMode = $request->input('install_mode'); 
            
            if (!$installMode) {
                // Se o usuário não escolheu (ex: não rodou teste), verificamos segurança
                try {
                    $hasTables = count(DB::select('SHOW TABLES')) > 0;
                    $installMode = $hasTables ? 'keep' : 'fresh';
                } catch (\Exception $e) {
                    $installMode = 'fresh';
                }
            }
            
            if ($installMode === 'keep') {
                // Apenas migra as alterações pendentes, mantendo os dados
                Artisan::call('migrate', ['--force' => true]);
                // Não roda seeders para evitar duplicação
            } else {
                // Instalação limpa: apaga tudo e recria
                Artisan::call('migrate:fresh', [
                    '--force' => true,
                    '--seed' => true
                ]);
            }

            // 4. Criar arquivo de lock
            touch(storage_path('installed'));

            return redirect('/')->with('success', 'Instalação concluída com sucesso!');

        } catch (\Exception $e) {
            Log::error('Erro na instalação: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Erro durante a instalação: ' . $e->getMessage()]);
        }
    }

    private function updateEnv($data)
    {
        $path = base_path('.env');
        
        if (!file_exists($path)) {
            // Tenta copiar do .env.example se não existir
            if (file_exists(base_path('.env.example'))) {
                copy(base_path('.env.example'), $path);
            } else {
                return; // Não tem o que fazer
            }
        }

        $content = file_get_contents($path);
        
        foreach ($data as $key => $value) {
            $value = (string) $value; // Ensure string
            
            // Trata espaços
            if (str_contains($value, ' ')) {
                $value = '"' . $value . '"';
            }
            
            // Se valor for null ou vazio
            if (empty($value)) {
                $value = '';
            }

            $pattern = "/^{$key}=.*/m";
            
            if (preg_match($pattern, $content)) {
                $content = preg_replace($pattern, "{$key}={$value}", $content);
            } else {
                $content .= "\n{$key}={$value}";
            }
        }

        file_put_contents($path, $content);
    }
}
