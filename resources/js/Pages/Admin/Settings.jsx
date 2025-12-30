import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
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
    });

    const [previewUrl, setPreviewUrl] = useState(settings.logo_path);

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
                            
                            <form onSubmit={submit} className="space-y-6 max-w-xl">
                                
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
                                            <img src={previewUrl} alt="Logo Preview" className="h-16 w-16 object-contain border rounded p-1 bg-gray-50" />
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

                                <div className="flex items-center gap-4">
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
