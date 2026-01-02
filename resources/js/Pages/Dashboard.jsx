import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler, DoughnutController, BarController, PieController } from 'chart.js';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/Components/Dashboard/SortableItem';
import BalanceEvolutionChart from '@/Components/Dashboard/BalanceEvolutionChart';
import CashFlowChart from '@/Components/Dashboard/CashFlowChart';
import TopTransactionsList from '@/Components/Dashboard/TopTransactionsList';
import StatusStatsChart from '@/Components/Dashboard/StatusStatsChart';
import NextDueList from '@/Components/Dashboard/NextDueList';
import { Wallet, TrendingUp, TrendingDown, GripHorizontal, Plus, X, Users, Shield, Activity, CreditCard, Lock, Pin, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Minus, RotateCcw, Unlock } from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler, DoughnutController, BarController, PieController);

export default function Dashboard({ 
    auth, 
    summary, 
    charts, 
    widgets, 
    layout = [], 
    cardWidths = {}, 
    categories, 
    isAdmin, 
    adminStats, 
    advancedStats, 
    hasAdvancedAccess 
}) {
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
    const [isDraggable, setIsDraggable] = useState(false);
    
    // Date Filter State
    const queryParams = new URLSearchParams(window.location.search);
    const [period, setPeriod] = useState(queryParams.get('period') || 'month');
    const [customStartDate, setCustomStartDate] = useState(queryParams.get('start_date') || '');
    const [customEndDate, setCustomEndDate] = useState(queryParams.get('end_date') || '');

    const { data: formWidgetData, setData: setWidgetData, post: postWidget, processing: processingWidget, errors: widgetErrors, reset: resetWidget } = useForm({
        name: '',
        type: 'expense',
        filters: {
            type: 'expense',
            categories: [],
            chart_type: 'none',
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
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
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
        const current = formWidgetData.filters.categories;
        const updated = current.includes(id) 
            ? current.filter(c => c !== id)
            : [...current, id];
        setWidgetData('filters', { ...formWidgetData.filters, categories: updated });
    };

    // --- Render Helpers ---

    const updateWidgetChartType = (widgetId, chartType) => {
        router.patch(route('dashboard.widgets.update', widgetId), {
            filters: { chart_type: chartType }
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const renderCard = (type, title, value, icon, colorClass, bgClass, id, isCustom = false, chartType = 'none', breakdown = [], previousValue = null) => {
        const hasChart = chartType !== 'none' && breakdown.length > 0;
        
        const chartData = hasChart ? {
            labels: breakdown.map(item => item.name),
            datasets: [
                {
                    data: breakdown.map(item => item.total),
                    backgroundColor: breakdown.map(item => item.color),
                    borderWidth: 0,
                },
            ],
        } : null;

        const options = {
            plugins: {
                legend: {
                    display: false, 
                }
            },
            cutout: chartType === 'doughnut' ? '70%' : undefined,
            responsive: true,
            maintainAspectRatio: false,
        };

        // Comparison Logic
        let variation = 0;
        let isPositive = false;
        let isNeutral = true;
        let variationColor = 'text-gray-500';

        if (previousValue !== null) {
            if (previousValue === 0) {
                variation = value === 0 ? 0 : 100;
            } else {
                variation = ((value - previousValue) / previousValue) * 100;
            }
            
            isPositive = variation > 0;
            isNeutral = variation === 0;

            if (!isNeutral) {
                if (type === 'income' || type === 'balance') {
                    variationColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                } else if (type === 'expense') {
                    variationColor = isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
                }
            }
        }

        return (
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full relative group transition-colors duration-200 flex flex-col justify-between">
                <div>
                    {isCustom && isDraggable && (
                        <button 
                            onClick={() => deleteWidget(id)}
                            className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity z-10"
                        >
                            <X size={20} />
                        </button>
                    )}
                    {isDraggable && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 cursor-grab active:cursor-grabbing z-10">
                            <GripHorizontal size={20} />
                        </div>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
                            {icon}
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 font-medium truncate pr-8" title={title}>{title}</h3>
                    </div>
                    <div className={`text-2xl font-bold ${colorClass}`}>
                        {formatCurrency(value)}
                    </div>
                    
                    {/* Comparison Badge */}
                    {previousValue !== null && (
                        <div className="flex items-center text-sm mt-2">
                            <span className={`flex items-center font-medium ${variationColor}`}>
                                {isNeutral ? (
                                    <Minus size={16} className="mr-1" />
                                ) : isPositive ? (
                                    <TrendingUp size={16} className="mr-1" />
                                ) : (
                                    <TrendingDown size={16} className="mr-1" />
                                )}
                                {Math.abs(variation).toFixed(1)}%
                            </span>
                            <span className="text-gray-400 ml-2 text-xs">vs. período anterior</span>
                        </div>
                    )}
                </div>

                {isCustom && (
                    <div className="mt-4">
                        {hasChart && (
                            <div className="h-32 mb-4 relative">
                                {chartType === 'doughnut' && <Doughnut data={chartData} options={options} />}
                                {chartType === 'pie' && <Pie data={chartData} options={options} />}
                                {chartType === 'bar' && <Bar data={chartData} options={{...options, scales: { x: { display: false }, y: { display: false } }}} />}
                            </div>
                        )}
                        
                        <div className="mt-2">
                            <select
                                value={chartType}
                                onChange={(e) => updateWidgetChartType(id.replace('widget_', ''), e.target.value)}
                                className="block w-full text-xs rounded-md border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="none">Sem Gráfico</option>
                                <option value="doughnut">Rosca</option>
                                <option value="pie">Pizza</option>
                                <option value="bar">Barras</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        );
    };

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
                {isDraggable && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 cursor-grab active:cursor-grabbing z-10">
                        <GripHorizontal size={20} />
                    </div>
                )}
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

    // Helper to determine card width class
    const getWidthClass = (id) => {
        const width = cardWidths[id] || '1/3';
        switch (width) {
            case '1/2': return 'lg:basis-[calc(50%-1.5rem)]';
            case 'full': return 'lg:basis-full';
            case '1/3': default: return 'lg:basis-[calc(33.333%-1.5rem)]';
        }
    };

    const handleWidthChange = (id, width, e) => {
        e.stopPropagation(); // Prevent drag start
        router.post(route('dashboard.card.width'), { id, width }, { preserveScroll: true });
    };

    // Mock Data for Locked State
    const mockAdvancedStats = {
        balanceEvolution: Array.from({ length: 15 }, (_, i) => ({
            date: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000).toISOString(),
            balance: Math.random() * 5000 + 1000
        })),
        cashFlow: Array.from({ length: 7 }, (_, i) => ({
            label: new Date(0, i).toLocaleString('pt-BR', { month: 'short' }),
            income: Math.random() * 5000 + 2000,
            expense: Math.random() * 4000 + 1000
        })),
        topTransactions: Array.from({ length: 5 }, (_, i) => ({
            id: i,
            description: `Transação Exemplo ${i + 1}`,
            amount: Math.random() * 500 + 100,
            type: Math.random() > 0.5 ? 'income' : 'expense',
            transaction_date: new Date().toISOString(),
            category: { name: 'Geral', color: '#9ca3af' }
        })),
        statusStats: {
            paid: { count: 15, total: 4500 },
            pending: { count: 5, total: 1200 },
            overdue: { count: 2, total: 300 }
        },
        nextDue: Array.from({ length: 5 }, (_, i) => ({
            id: i,
            description: `Conta a Vencer ${i + 1}`,
            amount: Math.random() * 200 + 50,
            type: 'expense',
            transaction_date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
            category: { name: 'Contas', color: '#ef4444' }
        }))
    };

    const renderItem = (id) => {
        if (id === 'balance') return renderCard('balance', 'Saldo Atual', summary?.balance, <Wallet size={24}/>, summary?.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400', 'bg-blue-100 dark:bg-blue-900/30', id, false, 'none', [], summary?.comparison?.balance);
        if (id === 'income') return renderCard('income', 'Receitas', summary?.income, <TrendingUp size={24}/>, 'text-green-600 dark:text-green-400', 'bg-green-100 dark:bg-green-900/30', id, false, 'none', [], summary?.comparison?.income);
        if (id === 'expense') return renderCard('expense', 'Despesas', summary?.expense, <TrendingDown size={24}/>, 'text-red-600 dark:text-red-400', 'bg-red-100 dark:bg-red-900/30', id, false, 'none', [], summary?.comparison?.expense);
        
        if (id === 'chart_income') return renderChart('Entradas por Categoria', 'incomeByCategory', id);
        if (id === 'chart_expense') return renderChart('Saídas por Categoria', 'expenseByCategory', id);

        // Advanced Charts
        switch (id) {
            case 'advanced_balance_evolution':
                return <BalanceEvolutionChart 
                    data={hasAdvancedAccess ? advancedStats.balanceEvolution : mockAdvancedStats.balanceEvolution} 
                    isLocked={!hasAdvancedAccess}
                />;
            case 'advanced_cash_flow':
                return <CashFlowChart 
                    data={hasAdvancedAccess ? advancedStats.cashFlow : mockAdvancedStats.cashFlow} 
                    isLocked={!hasAdvancedAccess}
                />;
            case 'advanced_top_transactions':
                return <TopTransactionsList 
                    transactions={hasAdvancedAccess ? advancedStats.topTransactions : mockAdvancedStats.topTransactions} 
                    isLocked={!hasAdvancedAccess}
                />;
            case 'advanced_status_stats':
                return <StatusStatsChart 
                    stats={hasAdvancedAccess ? advancedStats.statusStats : mockAdvancedStats.statusStats} 
                    isLocked={!hasAdvancedAccess}
                />;
            case 'advanced_next_due':
                return <NextDueList 
                    transactions={hasAdvancedAccess ? advancedStats.nextDue : mockAdvancedStats.nextDue} 
                    isLocked={!hasAdvancedAccess}
                />;
        }

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
                true,
                widget.chart_type,
                widget.breakdown
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>
                    {hasAdvancedAccess && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.post(route('dashboard.layout.reset'), {}, { preserveScroll: true })}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                title="Restaurar Layout Padrão"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button
                                onClick={() => setIsDraggable(!isDraggable)}
                                className={`p-2 rounded-full transition-colors ${isDraggable ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                title={isDraggable ? 'Bloquear Layout' : 'Desbloquear Layout'}
                            >
                                {isDraggable ? <Unlock size={20} /> : <Lock size={20} />}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {auth.user.plan && (
                        <div className="hidden md:flex flex-col items-end mr-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-primary-600 dark:text-primary-400">{auth.user.plan.name}</span>
                            {auth.user.plan_expires_at && (
                                <span>Vence em: {new Date(auth.user.plan_expires_at).toLocaleDateString()}</span>
                            )}
                        </div>
                    )}
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
                        <div className="flex flex-wrap gap-6">
                            {items.map((id) => (
                                <SortableItem 
                                    key={id} 
                                    id={id}
                                    disabled={!isDraggable}
                                    className={`
                                        flex-grow basis-[300px] md:basis-[calc(50%-1.5rem)]
                                        ${getWidthClass(id)}
                                        max-w-full
                                    `} 
                                >
                                    <div className={`h-full relative group ${id.startsWith('chart_') ? 'min-h-[300px]' : ''}`}>
                                        {isDraggable && (
                                            <div className="absolute -top-3 right-0 z-50 flex gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => handleWidthChange(id, '1/3', e)} 
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${!cardWidths[id] || cardWidths[id] === '1/3' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'}`}
                                                    title="Ocupar 33% (3 cards por linha)"
                                                >
                                                    33%
                                                </button>
                                                <button 
                                                    onClick={(e) => handleWidthChange(id, '1/2', e)} 
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cardWidths[id] === '1/2' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'}`}
                                                    title="Ocupar 50% (2 cards por linha)"
                                                >
                                                    50%
                                                </button>
                                                <button 
                                                    onClick={(e) => handleWidthChange(id, 'full', e)} 
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cardWidths[id] === 'full' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'}`}
                                                    title="Ocupar 100% (Linha inteira)"
                                                >
                                                    100%
                                                </button>
                                            </div>
                                        )}
                                        {renderItem(id)}
                                    </div>
                                </SortableItem>
                            ))}

                            {/* Add Widget Button */}
                            <div className="flex items-center justify-center min-h-[200px] flex-grow basis-[300px] md:basis-[calc(50%-1.5rem)] lg:basis-[calc(33.333%-1.5rem)] bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                {auth.user.features?.includes('create_custom_cards') ? (
                                    <button
                                        onClick={() => setShowAddWidgetModal(true)}
                                        className="w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                                        title="Adicionar Novo Card"
                                    >
                                        <Plus size={32} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.get(route('pricing.index'))}
                                        className="w-16 h-16 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full shadow-lg flex items-center justify-center transition-colors hover:bg-gray-400 dark:hover:bg-gray-600"
                                        title="Funcionalidade Premium - Clique para fazer upgrade"
                                    >
                                        <Lock size={32} />
                                    </button>
                                )}
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
                                value={formWidgetData.name}
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
                                        checked={formWidgetData.type === 'income' && formWidgetData.filters.type === 'income'}
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
                                        checked={formWidgetData.type === 'expense' && formWidgetData.filters.type === 'expense'}
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
                                {categories.filter(c => c.type === formWidgetData.type).map(cat => (
                                    <div 
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`p-2 rounded-full cursor-pointer text-sm border transition-colors ${
                                            formWidgetData.filters.categories.includes(cat.id) 
                                            ? 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                                {categories.filter(c => c.type === formWidgetData.type).length === 0 && (
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
