import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { system_settings } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <Head title="Cadastre-se" />

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6">
                        {system_settings?.logo_path ? (
                            <img 
                                src={system_settings.logo_path} 
                                alt={system_settings.app_name} 
                                className="h-12 w-auto mx-auto"
                            />
                        ) : (
                            <ApplicationLogo className="h-12 w-12 text-primary-600 fill-current mx-auto" />
                        )}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Crie sua conta grátis
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Comece a organizar suas finanças hoje mesmo.
                    </p>
                </div>

                {/* Social Login Buttons */}
                {(system_settings?.google_auth_enabled || system_settings?.facebook_auth_enabled) && (
                    <div className="space-y-3 mb-6">
                        {system_settings.google_auth_enabled && (
                            <a
                                href="/auth/google/redirect" 
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Cadastrar com Google
                            </a>
                        )}

                        {system_settings.facebook_auth_enabled && (
                            <a
                                href="/auth/facebook/redirect"
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full bg-[#1877F2] text-white font-medium hover:bg-[#166FE5] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Cadastrar com Facebook
                            </a>
                        )}

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    ou cadastre-se com seu email
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="name" value="Nome Completo" className="text-gray-700 font-medium" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Seu nome completo"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" className="text-gray-700 font-medium" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="seu@email.com"
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Senha" className="text-gray-700 font-medium" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="Mínimo 8 caracteres"
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Confirmar Senha" className="text-gray-700 font-medium" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            placeholder="Confirme sua senha"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <PrimaryButton 
                        className="w-full justify-center py-4 text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all" 
                        disabled={processing}
                    >
                        Criar Conta Grátis
                    </PrimaryButton>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <Link
                        href={route('login')}
                        className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                        Fazer login
                    </Link>
                </div>
            </div>
        </div>
    );
}