import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { CreditCard } from 'lucide-react';

export default function Index({ auth, settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        mercadopago_public_key: settings.mercadopago_public_key,
        mercadopago_access_token: settings.mercadopago_access_token,
        mercadopago_active: settings.mercadopago_active,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.gateways.update'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gateways de Pagamento</h2>}
        >
            <Head title="Gateways de Pagamento" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-dark-card overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            
                            <form onSubmit={submit} className="space-y-8 max-w-2xl">
                                
                                <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CreditCard className="text-blue-500" />
                                        <h3 className="text-lg font-medium">Mercado Pago</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Configure as credenciais do Mercado Pago para receber pagamentos.
                                        Você pode obter suas credenciais no <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Painel do Desenvolvedor</a>.
                                    </p>
                                </div>

                                {/* Active Status */}
                                <div className="block">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="mercadopago_active"
                                            checked={data.mercadopago_active}
                                            onChange={(e) => setData('mercadopago_active', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Ativar Mercado Pago</span>
                                    </label>
                                </div>

                                {/* Public Key */}
                                <div>
                                    <InputLabel htmlFor="mercadopago_public_key" value="Public Key" />
                                    <TextInput
                                        id="mercadopago_public_key"
                                        className="mt-1 block w-full"
                                        value={data.mercadopago_public_key}
                                        onChange={(e) => setData('mercadopago_public_key', e.target.value)}
                                        placeholder="APP_USR-..."
                                    />
                                    <InputError className="mt-2" message={errors.mercadopago_public_key} />
                                </div>

                                {/* Access Token */}
                                <div>
                                    <InputLabel htmlFor="mercadopago_access_token" value="Access Token" />
                                    <TextInput
                                        id="mercadopago_access_token"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.mercadopago_access_token}
                                        onChange={(e) => setData('mercadopago_access_token', e.target.value)}
                                        placeholder="APP_USR-..."
                                    />
                                    <InputError className="mt-2" message={errors.mercadopago_access_token} />
                                </div>

                                <div className="flex items-center gap-4">
                                    <PrimaryButton disabled={processing}>
                                        Salvar Configurações
                                    </PrimaryButton>

                                    {recentlySuccessful && (
                                        <p className="text-sm text-green-600 dark:text-green-400">Salvo com sucesso.</p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
