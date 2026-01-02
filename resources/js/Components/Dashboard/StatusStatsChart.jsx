import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { Lock } from 'lucide-react';
import { Link } from '@inertiajs/react';

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

export default function StatusStatsChart({ stats, isLocked = false }) {
    // stats is keyed by status: { paid: { count: 10, total: 100 }, pending: { count: 5, total: 50 } }
    
    const paid = stats?.paid || { count: 0, total: 0 };
    const pending = stats?.pending || { count: 0, total: 0 };

    const chartData = {
        labels: ['Pago/Recebido', 'Pendente'],
        datasets: [
            {
                data: [paid.total, pending.total],
                backgroundColor: ['#22c55e', '#eab308'], // green-500, yellow-500
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: '#9CA3AF'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Status das Transações</h3>
            <div className="flex-1 min-h-[200px] relative flex flex-col">
                <div className={`flex-1 flex flex-col ${isLocked ? 'filter blur-md select-none pointer-events-none opacity-50' : ''}`}>
                    <div className="flex-1 relative flex justify-center items-center">
                        {paid.total === 0 && pending.total === 0 ? (
                            <p className="text-gray-400">Sem dados</p>
                        ) : (
                            <div className="w-full h-full">
                                <Doughnut data={chartData} options={options} />
                            </div>
                        )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Concluídas</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{paid.count}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Pendentes</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{pending.count}</p>
                        </div>
                    </div>
                </div>
                {isLocked && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-xl shadow-lg flex flex-col items-center backdrop-blur-sm border border-gray-200 dark:border-gray-700 max-w-[90%]">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-3">
                                <Lock size={24} />
                            </div>
                            <p className="text-gray-800 dark:text-gray-200 font-semibold mb-1 text-center">Recurso Premium</p>
                            <Link 
                                href={route('pricing.index')} 
                                className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Fazer Upgrade
                            </Link>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
}
