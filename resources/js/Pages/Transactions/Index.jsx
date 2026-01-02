import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Plus, TrendingUp } from 'lucide-react';

export default function Index({ auth, transactions, categories, filters }) {
    const { delete: destroy } = useForm();
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [displayAmount, setDisplayAmount] = useState('');

    // Date Filter State
    const [period, setPeriod] = useState(filters?.period || 'month');
    const [customStartDate, setCustomStartDate] = useState(filters?.start_date || '');
    const [customEndDate, setCustomEndDate] = useState(filters?.end_date || '');

    // Handle Date Filter Change
    const handlePeriodChange = (e) => {
        const newPeriod = e.target.value;
        setPeriod(newPeriod);
        
        if (newPeriod !== 'custom') {
            router.get(route('transactions.index'), { period: newPeriod }, { preserveState: true, preserveScroll: true });
        }
    };

    const applyCustomDateFilter = () => {
        if (customStartDate && customEndDate) {
            router.get(route('transactions.index'), { 
                period: 'custom', 
                start_date: customStartDate, 
                end_date: customEndDate 
            }, { preserveState: true, preserveScroll: true });
        }
    };

    const { data: transactionData, setData: setTransactionData, post: postTransaction, processing: processingTransaction, errors: transactionErrors, reset: resetTransaction } = useForm({
        description: '',
        amount: '',
        type: 'expense',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'paid',
    });

    const hasFutureTransactions = auth.user.features?.includes('future_transactions');

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            destroy(route('transactions.destroy', id));
        }
    };

    const handleAmountChange = (e) => {
        let value = e.target.value;
        const numericValue = value.replace(/\D/g, '');

        if (numericValue === '') {
            setDisplayAmount('');
            setTransactionData('amount', '');
            return;
        }

        const floatValue = parseFloat(numericValue) / 100;
        setDisplayAmount(floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setTransactionData('amount', floatValue);
    };

    const createTransaction = (e) => {
        e.preventDefault();
        postTransaction(route('transactions.store'), {
            onSuccess: () => {
                setShowTransactionModal(false);
                resetTransaction();
                setDisplayAmount('');
            }
        });
    };

    // Filtra categorias para transação
    const filteredCategories = categories.filter(category => category.type === transactionData.type);

    return (
                <AuthenticatedLayout
                    user={auth.user}
                    header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Transações</h2>}
                >
            <Head title="Transações" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-dark-card overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Histórico</h3>
                            
                            <div className="flex flex-wrap items-center gap-4 justify-end">
                                <select
                                    value={period}
                                    onChange={handlePeriodChange}
                                    className="rounded-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                >
                                    <option value="today">Hoje</option>
                                    <option value="week">Esta semana</option>
                                    <option value="last_15">Últimos 15 dias</option>
                                    <option value="month">Este mês</option>
                                    <option value="last_60">Últimos 60 dias</option>
                                    <option value="last_90">Últimos 90 dias</option>
                                    <option value="all">Todo o período</option>
                                    <option value="custom">Período personalizado</option>
                                </select>

                                {period === 'custom' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="rounded-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        />
                                        <span className="text-gray-500 dark:text-gray-400">até</span>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="rounded-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                        />
                                        <PrimaryButton onClick={applyCustomDateFilter} className="!p-2">
                                            <TrendingUp size={16} className="rotate-90" />
                                        </PrimaryButton>
                                    </div>
                                )}

                                <PrimaryButton onClick={() => setShowTransactionModal(true)} className="gap-2">
                                    <Plus size={16} />
                                    Nova Transação
                                </PrimaryButton>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descrição</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {new Date(transaction.transaction_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{transaction.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ backgroundColor: (transaction.category?.color || '#999') + '20', color: transaction.category?.color || '#999' }}>
                                                    {transaction.category?.name || 'Sem Categoria'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('transactions.edit', transaction.id)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4">Editar</Link>
                                                <button onClick={() => handleDelete(transaction.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Add Transaction */}
            <Modal show={showTransactionModal} onClose={() => setShowTransactionModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Nova Transação</h2>
                    <form onSubmit={createTransaction}>
                        <div>
                            <InputLabel htmlFor="description" value="Descrição" />
                            <TextInput
                                id="description"
                                type="text"
                                className="mt-1 block w-full"
                                value={transactionData.description}
                                onChange={(e) => setTransactionData('description', e.target.value)}
                                required
                                isFocused
                            />
                            <InputError message={transactionErrors.description} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="amount" value="Valor" />
                            <TextInput
                                id="amount"
                                type="text"
                                className="mt-1 block w-full"
                                value={displayAmount}
                                onChange={handleAmountChange}
                                placeholder="R$ 0,00"
                                required
                            />
                            <InputError message={transactionErrors.amount} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="type" value="Tipo" />
                            <select
                                id="type"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={transactionData.type}
                                onChange={(e) => setTransactionData('type', e.target.value)}
                            >
                                <option value="expense">Saída</option>
                                <option value="income">Entrada</option>
                            </select>
                            <InputError message={transactionErrors.type} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="category_id" value="Categoria" />
                            <select
                                id="category_id"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={transactionData.category_id}
                                onChange={(e) => setTransactionData('category_id', e.target.value)}
                                required
                            >
                                <option value="">Selecione uma categoria</option>
                                {filteredCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={transactionErrors.category_id} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="transaction_date" value="Data" />
                            <TextInput
                                id="transaction_date"
                                type="date"
                                className="mt-1 block w-full"
                                value={transactionData.transaction_date}
                                onChange={(e) => setTransactionData('transaction_date', e.target.value)}
                                required
                                max={!hasFutureTransactions ? new Date().toISOString().split('T')[0] : undefined}
                            />
                            {!hasFutureTransactions && (
                                <p className="text-xs text-gray-500 mt-1">Seu plano não permite lançamentos futuros.</p>
                            )}
                            <InputError message={transactionErrors.transaction_date} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                value={transactionData.status}
                                onChange={(e) => setTransactionData('status', e.target.value)}
                            >
                                <option value="paid">Pago / Recebido</option>
                                <option value="pending">Pendente</option>
                            </select>
                            <InputError message={transactionErrors.status} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <SecondaryButton onClick={() => setShowTransactionModal(false)}>Cancelar</SecondaryButton>
                            <PrimaryButton disabled={processingTransaction}>Salvar</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
