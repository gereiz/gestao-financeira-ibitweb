import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';

export default function Install({ db_config }) {
    const { data, setData, post, processing, errors } = useForm({
        host: db_config?.host || '127.0.0.1',
        port: db_config?.port || '3306',
        database: db_config?.database || 'laravel',
        username: db_config?.username || 'root',
        password: '',
        install_mode: null, // Será definido após teste ou assumido pelo backend
    });

    const [testStatus, setTestStatus] = useState({ type: null, message: '' });
    const [isTesting, setIsTesting] = useState(false);
    const [hasTables, setHasTables] = useState(false);

    const testConnection = async () => {
        setIsTesting(true);
        setTestStatus({ type: null, message: '' });
        setHasTables(false);

        try {
            const response = await axios.post(route('install.test'), data);
            setTestStatus({ type: 'success', message: response.data.message });
            
            if (response.data.has_tables) {
                setHasTables(true);
                setData('install_mode', 'keep'); // Default to keep if tables exist
            } else {
                setData('install_mode', 'fresh');
            }
        } catch (error) {
            setTestStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Erro ao conectar. Verifique os dados.' 
            });
        } finally {
            setIsTesting(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('install.store'));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Head title="Instalação do Sistema" />
            
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Instalação Inicial</h1>
                    <p className="text-blue-100 mt-2">Configure o banco de dados para começar</p>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Host */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Host do Banco de Dados</label>
                        <input
                            type="text"
                            value={data.host}
                            onChange={e => setData('host', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Ex: 127.0.0.1 ou db"
                            required
                        />
                        {errors.host && <div className="text-red-500 text-xs mt-1">{errors.host}</div>}
                    </div>

                    {/* Port */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Porta</label>
                        <input
                            type="text"
                            value={data.port}
                            onChange={e => setData('port', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Ex: 3306"
                            required
                        />
                        {errors.port && <div className="text-red-500 text-xs mt-1">{errors.port}</div>}
                    </div>

                    {/* Database */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome do Banco de Dados</label>
                        <input
                            type="text"
                            value={data.database}
                            onChange={e => setData('database', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Ex: meu_sistema"
                            required
                        />
                        {errors.database && <div className="text-red-500 text-xs mt-1">{errors.database}</div>}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuário</label>
                        <input
                            type="text"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Ex: root"
                            required
                        />
                        {errors.username && <div className="text-red-500 text-xs mt-1">{errors.username}</div>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Senha do banco"
                        />
                        {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                    </div>

                    {/* Modo de Instalação (Apenas se detectar tabelas) */}
                    {hasTables && (
                        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 animate-fade-in">
                            <label className="block text-sm font-medium text-yellow-800 mb-2">
                                Tabelas existentes detectadas. O que deseja fazer?
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        id="mode_keep"
                                        name="install_mode"
                                        type="radio"
                                        checked={data.install_mode === 'keep'}
                                        onChange={() => setData('install_mode', 'keep')}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="mode_keep" className="ml-3 block text-sm font-medium text-gray-700">
                                        Manter dados existentes (Apenas atualizar estrutura)
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="mode_fresh"
                                        name="install_mode"
                                        type="radio"
                                        checked={data.install_mode === 'fresh'}
                                        onChange={() => setData('install_mode', 'fresh')}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="mode_fresh" className="ml-3 block text-sm font-medium text-gray-700">
                                        Instalação Limpa (Apagar tudo e reinstalar)
                                    </label>
                                </div>
                            </div>
                            {data.install_mode === 'fresh' && (
                                <p className="mt-2 text-xs text-red-600 font-semibold">
                                    ⚠️ Atenção: Todos os dados existentes serão perdidos permanentemente.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Status do Teste */}
                    {testStatus.message && (
                        <div className={`p-3 rounded-md text-sm ${testStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {testStatus.message}
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={testConnection}
                            disabled={isTesting || processing}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isTesting ? 'Testando...' : 'Testar Conexão'}
                        </button>
                        
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {processing ? 'Instalando...' : 'Salvar e Instalar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
