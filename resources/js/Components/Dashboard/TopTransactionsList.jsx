import { TrendingUp, TrendingDown, Lock } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function TopTransactionsList({ transactions, isLocked = false }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Maiores Transações</h3>
            <div className="flex-1 overflow-y-auto pr-2 relative">
                <div className={`space-y-4 ${isLocked ? 'filter blur-md select-none pointer-events-none opacity-50' : ''}`}>
                    {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {transaction.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px] sm:max-w-[150px]">{transaction.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {transaction.category?.name} • {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            Nenhuma transação encontrada.
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
