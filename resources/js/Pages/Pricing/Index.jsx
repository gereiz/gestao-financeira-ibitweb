import { Head, Link, usePage, router } from '@inertiajs/react';
import { Check } from 'lucide-react';

export default function Index({ plans, hero, faq, auth }) {
    const { system_settings } = usePage().props;

    const handleSubscribe = (planId) => {
        if (!auth.user) {
            window.location.href = route('login');
        } else {
            router.post(route('checkout.store', planId));
        }
    };

    const handleCheckPayment = () => {
        if (!auth.user) {
            window.location.href = route('login');
        } else {
            // Usando URL direta para evitar problemas de cache no Ziggy/Route helper
            router.post('/checkout/check-status', {}, {
                onStart: () => alert('Verificando pagamento... aguarde.'),
                onFinish: () => {},
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Head title="Nossos Planos" />

            {/* Header Simples (Estilo Organizze) */}
            <header className="bg-white border-b border-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold" style={{ color: system_settings.primary_color }}>
                        {system_settings.logo_path && (
                            <img src={system_settings.logo_path} alt="Logo" className="h-8 w-auto" />
                        )}
                        <span>{system_settings.app_name}</span>
                    </Link>
                    <nav className="flex items-center space-x-4">
                        {auth.user ? (
                            <>
                                <button
                                    onClick={handleCheckPayment}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                                >
                                    Já paguei e não ativou?
                                </button>
                                <Link 
                                    href={route('dashboard')} 
                                    className="font-medium hover:opacity-80 transition"
                                    style={{ color: system_settings.primary_color }}
                                >
                                    Ir para o App
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href={route('login')} 
                                    className="font-medium hover:opacity-80 transition"
                                    style={{ color: system_settings.primary_color }}
                                >
                                    Entrar
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    className="text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition"
                                    style={{ backgroundColor: system_settings.primary_color }}
                                >
                                    Criar conta grátis
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            {hero && (
                <div className="bg-white pb-16 pt-12 text-center">
                    <div className="max-w-3xl mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                            {hero.title}
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            {hero.subtitle}
                        </p>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id} 
                            className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 flex flex-col ${
                                plan.is_featured ? 'transform scale-105 z-10' : 'border-transparent'
                            }`}
                            style={{ borderColor: plan.is_featured ? system_settings.primary_color : 'transparent' }}
                        >
                            {plan.is_featured && (
                                <div 
                                    className="text-white text-center text-sm font-bold py-1 uppercase tracking-wider"
                                    style={{ backgroundColor: system_settings.primary_color }}
                                >
                                    Mais Popular
                                </div>
                            )}
                            <div className="p-8 flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-extrabold text-gray-900">R$ {Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-gray-500 ml-2">/{
                                        {
                                            'monthly': 'mês',
                                            'quarterly': 'trimestre',
                                            'semiannual': 'semestre',
                                            'yearly': 'ano'
                                        }[plan.billing_period] || 'ano'
                                    }</span>
                                </div>
                                <p className="text-gray-600 mb-6 text-sm">
                                    {plan.description || 'Ideal para organizar suas finanças pessoais.'}
                                </p>
                                
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature.id} className="flex items-start">
                                            <Check className="h-5 w-5 mr-3 flex-shrink-0" style={{ color: system_settings.primary_color }} />
                                            <span className="text-gray-600 text-sm">{feature.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-8 bg-gray-50 mt-auto">
                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    className={`w-full py-3 px-6 rounded-xl font-bold text-center transition-colors ${
                                        plan.is_featured
                                            ? 'text-white shadow-lg hover:opacity-90'
                                            : 'bg-white border hover:bg-gray-50'
                                    }`}
                                    style={plan.is_featured ? {
                                        backgroundColor: system_settings.primary_color,
                                    } : {
                                        color: system_settings.primary_color,
                                        borderColor: system_settings.primary_color
                                    }}
                                >
                                    {auth.user ? 'Assinar Agora' : 'Começar Agora'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            {faq && faq.items && faq.items.length > 0 && (
                <div className="bg-white py-24 border-t border-gray-100">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                            {faq.title}
                        </h2>
                        <div className="space-y-8">
                            {faq.items.map((item, index) => (
                                <div key={index} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        {item.question}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-gray-50 py-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} GestãoFinanceira. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
