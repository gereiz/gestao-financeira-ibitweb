import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Edit({ auth, user, plans }) {
    const { data, setData, put, processing, errors } = useForm({
        plan_id: user.plan_id || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Editar Plano do Usuário: {user.name}</h2>}
        >
            <Head title={`Editar Usuário - ${user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-dark-card overflow-hidden shadow-sm sm:rounded-lg p-6 max-w-lg mx-auto">
                        <form onSubmit={submit}>
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                    Selecione o novo plano para o usuário <strong>{user.name}</strong> ({user.email}).
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="plan_id" value="Plano" />
                                <select
                                    id="plan_id"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.plan_id}
                                    onChange={(e) => setData('plan_id', e.target.value)}
                                    required
                                >
                                    <option value="">Selecione um plano...</option>
                                    {plans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)} / {plan.billing_period === 'monthly' ? 'Mês' : 'Ano'}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.plan_id} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end mt-8">
                                <Link
                                    href={route('admin.users.index')}
                                    className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                                >
                                    Cancelar
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Salvar Alterações
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
