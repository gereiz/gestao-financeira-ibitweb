import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Plus } from 'lucide-react';

export default function Index({ auth, transactions, categories }) {
    const { delete: destroy } = useForm();
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [displayAmount, setDisplayAmount] = useState('');

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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Transações</h2>}
        >
            <Head title="Transações" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-lg font-medium">Histórico</h3>
                            <PrimaryButton onClick={() => setShowTransactionModal(true)} className="gap-2">
                                <Plus size={16} />
                                Nova Transação
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(transaction.transaction_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ backgroundColor: (transaction.category?.color || '#999') + '20', color: transaction.category?.color || '#999' }}>
                                                    {transaction.category?.name || 'Sem Categoria'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('transactions.edit', transaction.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                                                <button onClick={() => handleDelete(transaction.id)} className="text-red-600 hover:text-red-900">Excluir</button>
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
