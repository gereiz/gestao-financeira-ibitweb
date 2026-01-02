import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useState, useEffect } from 'react';

export default function Create({ auth, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        description: '',
        amount: '',
        type: 'expense',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'paid',
    });

    const hasFutureTransactions = auth.user.features?.includes('future_transactions');

    const [displayAmount, setDisplayAmount] = useState('');

    // Filtra categorias baseado no tipo selecionado
    const filteredCategories = categories.filter(category => category.type === data.type);

    // Limpa a categoria se trocar o tipo e a categoria atual não for válida
    useEffect(() => {
        const currentCategory = categories.find(c => c.id === data.category_id);
        if (currentCategory && currentCategory.type !== data.type) {
            setData('category_id', '');
        }
    }, [data.type]);

    const handleAmountChange = (e) => {
        let value = e.target.value;
        const numericValue = value.replace(/\D/g, '');

        if (numericValue === '') {
            setDisplayAmount('');
            setData('amount', '');
            return;
        }

        const floatValue = parseFloat(numericValue) / 100;
        setDisplayAmount(floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setData('amount', floatValue);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('transactions.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Nova Transação</h2>}
        >
            <Head title="Nova Transação" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-dark-card overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            <div>
                                <InputLabel htmlFor="description" value="Descrição" />
                                <TextInput
                                    id="description"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    required
                                    isFocused
                                />
                                <InputError message={errors.description} className="mt-2" />
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
                                <InputError message={errors.amount} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="type" value="Tipo" />
                                <select
                                    id="type"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                >
                                    <option value="expense">Saída</option>
                                    <option value="income">Entrada</option>
                                </select>
                                <InputError message={errors.type} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="category_id" value="Categoria" />
                                <select
                                    id="category_id"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {filteredCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-2" />
                                <div className="mt-1">
                                    <Link href={route('categories.create')} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                        + Criar nova categoria
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="transaction_date" value="Data" />
                                <TextInput
                                    id="transaction_date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.transaction_date}
                                    onChange={(e) => setData('transaction_date', e.target.value)}
                                    required
                                    max={!hasFutureTransactions ? new Date().toISOString().split('T')[0] : undefined}
                                />
                                {!hasFutureTransactions && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Seu plano não permite lançamentos futuros.</p>
                                )}
                                <InputError message={errors.transaction_date} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="paid">Pago / Recebido</option>
                                    <option value="pending">Pendente</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end mt-4">
                                <Link
                                    href={route('transactions.index')}
                                    className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                                >
                                    Cancelar
                                </Link>
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Salvar
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
