import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import { useState } from 'react';

export default function Settings({ auth, settings }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        app_name: settings.app_name,
        logo: null,
        primary_color: settings.primary_color,
        font_family: settings.font_family,
        google_client_id: settings.google_client_id,
        google_client_secret: settings.google_client_secret,
        facebook_client_id: settings.facebook_client_id,
        facebook_client_secret: settings.facebook_client_secret,
        mercadopago_access_token: settings.mercadopago_access_token,
        mercadopago_public_key: settings.mercadopago_public_key,
    });

    const [previewUrl, setPreviewUrl] = useState(settings.logo_path);
    const [faviconPreviewUrl, setFaviconPreviewUrl] = useState(settings.favicon_path);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        setData('logo', file);
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(settings.logo_path);
        }
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        setData('favicon', file);
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFaviconPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFaviconPreviewUrl(settings.favicon_path);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Configurações do Sistema</h2>}
        >
            <Head title="Configurações do Sistema" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            
                            <form onSubmit={submit} className="space-y-6 max-w-4xl">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Geral</h3>
                                        
                                        {/* App Name */}
                                        <div>
                                            <InputLabel htmlFor="app_name" value="Nome do Sistema" />
                                            <TextInput
                                                id="app_name"
                                                className="mt-1 block w-full"
                                                value={data.app_name}
                                                onChange={(e) => setData('app_name', e.target.value)}
                                                required
                                                isFocused
                                                autoComplete="name"
                                            />
                                            <InputError className="mt-2" message={errors.app_name} />
                                        </div>

                                        {/* Logo */}
                                        <div>
                                            <InputLabel htmlFor="logo" value="Logo do Sistema" />
                                            <div className="flex items-center gap-4 mt-2">
                                                {previewUrl && (
                                                    <img src={previewUrl} alt="Logo Preview" className="h-16 w-auto object-contain border rounded p-1 bg-gray-50" />
                                                )}
                                                <input 
                                                    type="file" 
                                                    id="logo"
                                                    onChange={handleLogoChange}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                                    accept="image/*"
                                                />
                                            </div>
                                            <InputError className="mt-2" message={errors.logo} />
                                        </div>

                                        {/* Favicon */}
                                        <div>
                                            <InputLabel htmlFor="favicon" value="Favicon (Ícone)" />
                                            <div className="flex items-center gap-4 mt-2">
                                                {faviconPreviewUrl && (
                                                    <img src={faviconPreviewUrl} alt="Favicon Preview" className="h-8 w-8 object-contain border rounded p-1 bg-gray-50" />
                                                )}
                                                <input 
                                                    type="file" 
                                                    id="favicon"
                                                    onChange={handleFaviconChange}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                                    accept=".ico,.png,.jpg,.svg"
                                                />
                                            </div>
                                            <InputError className="mt-2" message={errors.favicon} />
                                        </div>

                                        {/* Primary Color */}
                                        <div>
                                            <InputLabel htmlFor="primary_color" value="Cor Primária" />
                                            <div className="flex items-center gap-2 mt-1">
                                                <TextInput
                                                    id="primary_color"
                                                    type="color"
                                                    className="h-10 w-16 p-1 cursor-pointer"
                                                    value={data.primary_color}
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                    required
                                                />
                                                <TextInput
                                                    type="text"
                                                    className="block w-full"
                                                    value={data.primary_color}
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                    pattern="^#[0-9A-Fa-f]{6}$"
                                                />
                                            </div>
                                            <InputError className="mt-2" message={errors.primary_color} />
                                        </div>

                                        {/* Font Family */}
                                        <div>
                                            <InputLabel htmlFor="font_family" value="Família da Fonte (Google Fonts)" />
                                            <TextInput
                                                id="font_family"
                                                className="mt-1 block w-full"
                                                value={data.font_family}
                                                onChange={(e) => setData('font_family', e.target.value)}
                                                placeholder="Ex: Roboto, Open Sans, Inter"
                                                required
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Certifique-se de que o nome da fonte está correto conforme o Google Fonts.
                                            </p>
                                            <InputError className="mt-2" message={errors.font_family} />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Autenticação Social</h3>
                                        <p className="text-sm text-gray-500">
                                            Preencha as credenciais para habilitar o login social. Deixe em branco para desabilitar.
                                        </p>

                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                                                </svg>
                                                Google Login
                                            </h4>
                                            
                                            <div>
                                                <InputLabel htmlFor="google_client_id" value="Client ID" />
                                                <TextInput
                                                    id="google_client_id"
                                                    className="mt-1 block w-full"
                                                    value={data.google_client_id}
                                                    onChange={(e) => setData('google_client_id', e.target.value)}
                                                />
                                                <InputError className="mt-2" message={errors.google_client_id} />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="google_client_secret" value="Client Secret" />
                                                <TextInput
                                                    id="google_client_secret"
                                                    type="password"
                                                    className="mt-1 block w-full"
                                                    value={data.google_client_secret}
                                                    onChange={(e) => setData('google_client_secret', e.target.value)}
                                                />
                                                <InputError className="mt-2" message={errors.google_client_secret} />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                                Facebook Login
                                            </h4>
                                            
                                            <div>
                                                <InputLabel htmlFor="facebook_client_id" value="App ID" />
                                                <TextInput
                                                    id="facebook_client_id"
                                                    className="mt-1 block w-full"
                                                    value={data.facebook_client_id}
                                                    onChange={(e) => setData('facebook_client_id', e.target.value)}
                                                />
                                                <InputError className="mt-2" message={errors.facebook_client_id} />
                                            </div>

                                            <div>
                                                <InputLabel htmlFor="facebook_client_secret" value="App Secret" />
                                                <TextInput
                                                    id="facebook_client_secret"
                                                    type="password"
                                                    className="mt-1 block w-full"
                                                    value={data.facebook_client_secret}
                                                    onChange={(e) => setData('facebook_client_secret', e.target.value)}
                                                />
                                                <InputError className="mt-2" message={errors.facebook_client_secret} />
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6 border-t">
                                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Pagamentos (Mercado Pago)</h3>
                                            <p className="text-sm text-gray-500">
                                                Configure as credenciais para processar pagamentos.
                                            </p>

                                            <div className="space-y-4">
                                                <div>
                                                    <InputLabel htmlFor="mercadopago_access_token" value="Access Token" />
                                                    <TextInput
                                                        id="mercadopago_access_token"
                                                        type="password"
                                                        className="mt-1 block w-full"
                                                        value={data.mercadopago_access_token}
                                                        onChange={(e) => setData('mercadopago_access_token', e.target.value)}
                                                        placeholder="TEST-..."
                                                    />
                                                    <InputError className="mt-2" message={errors.mercadopago_access_token} />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor="mercadopago_public_key" value="Public Key" />
                                                    <TextInput
                                                        id="mercadopago_public_key"
                                                        className="mt-1 block w-full"
                                                        value={data.mercadopago_public_key}
                                                        onChange={(e) => setData('mercadopago_public_key', e.target.value)}
                                                        placeholder="TEST-..."
                                                    />
                                                    <InputError className="mt-2" message={errors.mercadopago_public_key} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-6 border-t">
                                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Manutenção do Sistema</h3>
                                            <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                                <div>
                                                    <h4 className="font-medium text-yellow-800">Correção de Imagens</h4>
                                                    <p className="text-sm text-yellow-700 mt-1">
                                                        Se o logo ou favicon não estiverem aparecendo (erro 403), clique aqui para corrigir o link de armazenamento.
                                                    </p>
                                                </div>
                                                <Link
                                                    href={route('admin.fix-storage')}
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                                >
                                                    Corrigir Imagens
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-8 pt-6 border-t">
                                    <PrimaryButton disabled={processing} className="rounded-full">
                                        Salvar Alterações
                                    </PrimaryButton>

                                    {recentlySuccessful && (
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Salvo com sucesso.
                                        </p>
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
