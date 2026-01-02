import { Calendar, AlertCircle, Lock } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function NextDueList({ transactions, isLocked = false }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-500" />
                Próximos Vencimentos
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 relative">
                <div className={`space-y-3 ${isLocked ? 'filter blur-md select-none pointer-events-none opacity-50' : ''}`}>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 transition-colors ${isToday(transaction.transaction_date) ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' : 'bg-gray-50 border-gray-300 dark:bg-gray-800/50 dark:border-gray-600'}`}>
                                <div className="flex items-center gap-3">
                                    {isToday(transaction.transaction_date) && (
                                        <div className="text-orange-500" title="Vence Hoje">
                                            <AlertCircle size={16} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px] sm:max-w-[150px]">{transaction.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                        Pendente
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Nenhuma conta pendente próxima.
                        </div>
                    )}
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
