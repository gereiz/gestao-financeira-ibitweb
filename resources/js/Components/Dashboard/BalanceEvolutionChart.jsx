import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, LineController } from 'chart.js';
import { Lock } from 'lucide-react';
import { Link } from '@inertiajs/react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, LineController);

export default function BalanceEvolutionChart({ data, isLocked = false }) {
    const chartData = {
        labels: data.map(item => new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
        datasets: [
            {
                label: 'Saldo Acumulado',
                data: data.map(item => item.balance),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: !isLocked, // Disable tooltip if locked
                mode: 'index',
                intersect: false,
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
            },
        },
        scales: {
            y: {
                beginAtZero: false,
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
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Evolução do Saldo</h3>
            <div className="flex-1 min-h-[250px] relative">
                <div className={`h-full w-full ${isLocked ? 'filter blur-md select-none pointer-events-none opacity-50' : ''}`}>
                    <Line data={chartData} options={options} />
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
