import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController } from 'chart.js';
import { Lock } from 'lucide-react';
import { Link } from '@inertiajs/react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController);

export default function CashFlowChart({ data, isLocked = false }) {
    const chartData = {
        labels: data.map(item => item.label),
        datasets: [
            {
                label: 'Entradas',
                data: data.map(item => item.income),
                backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
                borderRadius: 4,
            },
            {
                label: 'Saídas',
                data: data.map(item => item.expense),
                backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                enabled: !isLocked,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                grid: {
                    display: false,
                }
            }
        },
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Entradas vs Saídas</h3>
            <div className="flex-1 min-h-[250px] relative">
                <div className={`h-full w-full ${isLocked ? 'filter blur-md select-none pointer-events-none opacity-50' : ''}`}>
                    <Bar data={chartData} options={options} />
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
