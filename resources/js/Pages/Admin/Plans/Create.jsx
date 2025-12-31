import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function Create({ auth, availableFeatures }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        billing_period: 'monthly',
        max_transactions: 100,
        features: [],
        is_featured: false,
        is_recurring: false,
    });

    const handleFeatureToggle = (slug) => {
        if (data.features.includes(slug)) {
            setData('features', data.features.filter(f => f !== slug));
        } else {
            setData('features', [...data.features, slug]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.plans.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Criar Novo Plano</h2>}
        >
            <Head title="Criar Plano" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-dark-card overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Nome do Plano" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        isFocused
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="description" value="Descrição" />
                                    <textarea
                                        id="description"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows="3"
                                        placeholder="Breve descrição do plano (ex: Ideal para iniciantes)"
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="price" value="Preço" />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        className="mt-1 block w-full"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.price} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="billing_period" value="Ciclo de Cobrança" />
                                    <select
                                        id="billing_period"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-dark-card dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.billing_period}
                                        onChange={(e) => setData('billing_period', e.target.value)}
                                    >
                                        <option value="monthly">Mensal</option>
                                        <option value="quarterly">Trimestral</option>
                                        <option value="semiannual">Semestral</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                    <InputError message={errors.billing_period} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="is_recurring"
                                            checked={data.is_recurring}
                                            onChange={(e) => setData('is_recurring', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                            Cobrança Recorrente (Assinatura Automática via Mercado Pago)
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">
                                        Se marcado, o plano será criado no Mercado Pago e cobrará automaticamente do cliente a cada ciclo.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="max_transactions" value="Max. Transações (-1 para ilimitado)" />
                                    <TextInput
                                        id="max_transactions"
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.max_transactions}
                                        onChange={(e) => setData('max_transactions', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.max_transactions} className="mt-2" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Plano em Destaque (Featured)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Funcionalidades (Features)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(availableFeatures).map(([slug, name]) => (
                                        <label key={slug} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                                                checked={data.features.includes(slug)}
                                                onChange={() => handleFeatureToggle(slug)}
                                            />
                                            <span className="text-gray-700 dark:text-gray-300">{name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-8">
                                <Link
                                    href={route('admin.plans.index')}
                                    className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                                >
                                    Cancelar
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Criar Plano
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
