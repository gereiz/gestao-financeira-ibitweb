import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, LineController, BarController } from 'chart.js';
import { Lock } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineController,
    BarController
);

export default function Index({ auth, hasAccess, data }) {
    const evolutionOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Evolução Financeira (Últimos 12 Meses)' },
        },
    };

    const evolutionData = hasAccess ? {
        labels: data.evolution.map(item => item.month),
        datasets: [
            {
                label: 'Receitas',
                data: data.evolution.map(item => item.income),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
            },
            {
                label: 'Despesas',
                data: data.evolution.map(item => item.expense),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
            },
        ],
    } : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Relatórios Avançados</h2>}
        >
            <Head title="Relatórios Avançados" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {!hasAccess ? (
                        <div className="bg-white dark:bg-dark-card overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <Lock size={48} className="text-gray-400" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Funcionalidade Bloqueada</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Os Relatórios Avançados estão disponíveis apenas para usuários do plano Premium. 
                                Faça um upgrade para desbloquear análises detalhadas e tomar melhores decisões financeiras.
                            </p>
                            <Link
                                href={route('pricing.index')}
                                className="inline-flex items-center rounded-full border border-transparent bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-primary-700 focus:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-900"
                            >
                                Fazer Upgrade para Premium
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Evolution Chart */}
                            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <Line options={evolutionOptions} data={evolutionData} />
                            </div>

                            {/* Top Expenses */}
                            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Maiores Despesas por Categoria</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                            <tr>
                                                <th className="px-6 py-3">Categoria</th>
                                                <th className="px-6 py-3 text-right">Total Gasto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {data.topExpenses.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                                                        {parseFloat(item.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
