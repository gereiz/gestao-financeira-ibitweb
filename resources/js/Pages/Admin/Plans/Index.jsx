import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export default function Index({ auth, plans }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) {
            destroy(route('admin.plans.destroy', id));
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const periodLabels = {
        monthly: 'Mensal',
        quarterly: 'Trimestral',
        semiannual: 'Semestral',
        yearly: 'Anual'
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gerenciar Planos</h2>}
        >
            <Head title="Gerenciar Planos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-dark-card overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Planos de Assinatura</h3>
                            <Link href={route('admin.plans.create')}>
                                <PrimaryButton className="flex items-center gap-2">
                                    <Plus size={16} />
                                    Novo Plano
                                </PrimaryButton>
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-3">Nome</th>
                                        <th className="px-6 py-3">Preço</th>
                                        <th className="px-6 py-3">Ciclo</th>
                                        <th className="px-6 py-3">Transações</th>
                                        <th className="px-6 py-3">Features</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {plans.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{plan.name}</td>
                                            <td className="px-6 py-4">{formatCurrency(plan.price)}</td>
                                            <td className="px-6 py-4">
                                                {periodLabels[plan.billing_period] || plan.billing_period}
                                            </td>
                                            <td className="px-6 py-4">
                                                {plan.max_transactions === -1 ? (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs">
                                                        Ilimitadas
                                                    </span>
                                                ) : (
                                                    plan.max_transactions
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {plan.features.map(f => (
                                                        <span key={f.id} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 rounded text-xs">
                                                            {f.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {plan.is_active ? (
                                                    <span className="flex items-center text-green-600 dark:text-green-400 gap-1">
                                                        <Check size={14} /> Ativo
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600 dark:text-red-400 gap-1">
                                                        <X size={14} /> Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <Link href={route('admin.plans.edit', plan.id)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                                    <Pencil size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(plan.id)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {plans.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum plano cadastrado.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
