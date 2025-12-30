import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/Components/Dashboard/SortableItem';
import { Wallet, TrendingUp, TrendingDown, GripHorizontal, Plus, X, Users, Shield, Activity, CreditCard } from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ auth, summary, charts, widgets, layout, categories, isAdmin, adminStats }) {
    if (isAdmin) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard Administrativo</h2>}
            >
                <Head title="Admin Dashboard" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total de Usuários</p>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{adminStats.totalUsers}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Usuários Ativos</p>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{adminStats.activeUsers}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder for future stats */}
                            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Admin</p>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">Sistema</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plans Breakdown */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard size={20} />
                                Usuários por Plano
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {adminStats.usersByPlan.map(plan => (
                                    <div key={plan.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{plan.name}</span>
                                        <span className="font-bold text-primary-600 dark:text-primary-400">{plan.users_count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Usuários Recentes</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="px-6 py-3">Nome</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Data de Registro</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {adminStats.recentUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800'}`}>
                                                        {user.is_active ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const [items, setItems] = useState(layout);
    const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
    
    // Date Filter State
    const queryParams = new URLSearchParams(window.location.search);
    const [period, setPeriod] = useState(queryParams.get('period') || 'month');
    const [customStartDate, setCustomStartDate] = useState(queryParams.get('start_date') || '');
    const [customEndDate, setCustomEndDate] = useState(queryParams.get('end_date') || '');

    const { data: widgetData, setData: setWidgetData, post: postWidget, processing: processingWidget, errors: widgetErrors, reset: resetWidget } = useForm({
        name: '',
        type: 'expense',
        filters: {
            type: 'expense',
            categories: [],
        }
    });

    const { data: transactionData, setData: setTransactionData, post: postTransaction, processing: processingTransaction, errors: transactionErrors, reset: resetTransaction } = useForm({
        description: '',
        amount: '',
        type: 'expense',
        category_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'paid',
    });

    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [displayAmount, setDisplayAmount] = useState('');

    const hasFutureTransactions = auth.user.features?.includes('future_transactions');

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

    // Filtra categorias para transação
    const filteredCategories = categories.filter(category => category.type === transactionData.type);

    useEffect(() => {
        setItems(layout);
    }, [layout]);

    // Handle Date Filter Change
    const handlePeriodChange = (e) => {
        const newPeriod = e.target.value;
        setPeriod(newPeriod);
        
        if (newPeriod !== 'custom') {
            router.get(route('dashboard'), { period: newPeriod }, { preserveState: true, preserveScroll: true });
        }
    };

    const applyCustomDateFilter = () => {
        if (customStartDate && customEndDate) {
            router.get(route('dashboard'), { 
                period: 'custom', 
                start_date: customStartDate, 
                end_date: customEndDate 
            }, { preserveState: true, preserveScroll: true });
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            
            setItems(newItems);
            
            // Persist order
            axios.post(route('dashboard.layout.update'), { layout: newItems });
        }
    };

    const formatCurrency = (value) => {
        return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';
    };

    const createWidget = (e) => {
        e.preventDefault();
        postWidget(route('dashboard.widgets.store'), {
            onSuccess: () => {
                setShowAddWidgetModal(false);
                resetWidget();
            }
        });
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

    const deleteWidget = (id) => {
        if (confirm('Tem certeza que deseja remover este card?')) {
             const widgetId = id.replace('widget_', '');
             router.delete(route('dashboard.widgets.destroy', widgetId));
        }
    };

    const toggleCategory = (id) => {
        const current = widgetData.filters.categories;
        const updated = current.includes(id) 
            ? current.filter(c => c !== id)
            : [...current, id];
        setWidgetData('filters', { ...widgetData.filters, categories: updated });
    };

    // --- Render Helpers ---

    const renderCard = (type, title, value, icon, colorClass, bgClass, id, isCustom = false) => (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full relative group transition-colors duration-200">
            {isCustom && (
                <button 
                    onClick={() => deleteWidget(id)}
                    className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity z-10"
                >
                    <X size={20} />
                </button>
            )}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 cursor-grab active:cursor-grabbing z-10">
                <GripHorizontal size={20} />
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
                    {icon}
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium truncate pr-8" title={title}>{title}</h3>
            </div>
            <div className={`text-2xl font-bold ${colorClass}`}>
                {formatCurrency(value)}
            </div>
        </div>
    );

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 20, color: '#9CA3AF' }
            }
        },
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false
    };

    const renderChart = (title, dataKey, id) => {
        const chartData = {
            labels: charts?.[dataKey]?.map(c => c.name) || [],
            datasets: [{
                data: charts?.[dataKey]?.map(c => c.total) || [],
                backgroundColor: charts?.[dataKey]?.map(c => c.color) || [],
                borderWidth: 0,
            }],
        };

        return (
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200 h-full relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 cursor-grab active:cursor-grabbing z-10">
                    <GripHorizontal size={20} />
                </div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                </div>
                <div className="h-64 flex justify-center relative">
                    {charts?.[dataKey]?.length > 0 ? (
                        <Doughnut data={chartData} options={chartOptions} />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <p>Sem dados neste mês</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderItem = (id) => {
        if (id === 'balance') return renderCard('balance', 'Saldo Atual', summary?.balance, <Wallet size={24}/>, summary?.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400', 'bg-blue-100 dark:bg-blue-900/30', id);
        if (id === 'income') return renderCard('income', 'Receitas', summary?.income, <TrendingUp size={24}/>, 'text-green-600 dark:text-green-400', 'bg-green-100 dark:bg-green-900/30', id);
        if (id === 'expense') return renderCard('expense', 'Despesas', summary?.expense, <TrendingDown size={24}/>, 'text-red-600 dark:text-red-400', 'bg-red-100 dark:bg-red-900/30', id);
        
        if (id === 'chart_income') return renderChart('Entradas por Categoria', 'incomeByCategory', id);
        if (id === 'chart_expense') return renderChart('Saídas por Categoria', 'expenseByCategory', id);

        if (id.startsWith('widget_')) {
            const widget = widgets[id];
            if (!widget) return null;
            const isIncome = widget.type === 'income';
            return renderCard(
                widget.type, 
                widget.name, 
                widget.value, 
                isIncome ? <TrendingUp size={24}/> : <TrendingDown size={24}/>,
                isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
                id,
                true
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>
                
                <div className="flex flex-wrap items-center gap-3">
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
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-start my-2 md:my-0">
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
        }>
            <Head title="Dashboard" />

            <div className="py-6">
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={items}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((id) => (
                                <SortableItem 
                                    key={id} 
                                    id={id}
                                    className={id.startsWith('chart_') ? 'md:col-span-1 lg:col-span-1 xl:col-span-1' : ''} 
                                >
                                    <div className={`h-full ${id.startsWith('chart_') ? 'min-h-[300px]' : ''}`}>
                                        {renderItem(id)}
                                    </div>
                                </SortableItem>
                            ))}

                            {/* Add Widget Button */}
                            <div className="flex items-center justify-center min-h-[200px]">
                                <button
                                    onClick={() => setShowAddWidgetModal(true)}
                                    className="w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                                    title="Adicionar Novo Card"
                                >
                                    <Plus size={32} />
                                </button>
                            </div>
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Modal Add Widget */}
            <Modal show={showAddWidgetModal} onClose={() => setShowAddWidgetModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Adicionar Novo Card</h2>
                    <form onSubmit={createWidget}>
                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Nome do Card" />
                            <TextInput
                                id="name"
                                value={widgetData.name}
                                onChange={(e) => setWidgetData('name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Ex: Gastos Mercado"
                            />
                            <InputError message={widgetErrors.name} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel value="Tipo de Transação" />
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="income"
                                        checked={widgetData.type === 'income' && widgetData.filters.type === 'income'}
                                        onChange={() => setWidgetData(d => ({ ...d, type: 'income', filters: { ...d.filters, type: 'income' } }))}
                                        className="rounded-full border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">Receita</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="expense"
                                        checked={widgetData.type === 'expense' && widgetData.filters.type === 'expense'}
                                        onChange={() => setWidgetData(d => ({ ...d, type: 'expense', filters: { ...d.filters, type: 'expense' } }))}
                                        className="rounded-full border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">Despesa</span>
                                </label>
                            </div>
                        </div>

                        <div className="mb-4">
                            <InputLabel value="Filtrar por Categorias (Opcional)" />
                            <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                                {categories.filter(c => c.type === widgetData.type).map(cat => (
                                    <div 
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`p-2 rounded-full cursor-pointer text-sm border transition-colors ${
                                            widgetData.filters.categories.includes(cat.id) 
                                            ? 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                                {categories.filter(c => c.type === widgetData.type).length === 0 && (
                                    <p className="col-span-2 text-gray-500 text-sm p-2">Nenhuma categoria encontrada para este tipo.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <SecondaryButton onClick={() => setShowAddWidgetModal(false)}>Cancelar</SecondaryButton>
                            <PrimaryButton disabled={processingWidget}>Criar Card</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

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
