import { Head, Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { PieChart, BarChart, Target, CheckCircle, ArrowRight, Star, Quote } from 'lucide-react';

export default function Welcome({ auth, sections }) {
    const { system_settings } = usePage().props;

    // Helper to get icon component
    const getIcon = (iconName) => {
        const icons = {
            'pie-chart': PieChart,
            'bar-chart': BarChart,
            'target': Target,
        };
        const IconComponent = icons[iconName] || CheckCircle;
        return <IconComponent className="h-8 w-8 text-primary-600" />;
    };

    return (
        <>
            <Head title="Bem-vindo" />
            
            <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
                {/* Navbar */}
                <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <ApplicationLogo className="h-8 w-8 text-primary-600 fill-current" />
                                    <span className="text-xl font-bold text-gray-900">
                                        {system_settings?.app_name || 'Finanças'}
                                    </span>
                                </Link>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                                        >
                                            Entrar
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Cadastre-se Grátis
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                {sections?.hero && (
                    <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col lg:flex-row items-center gap-12">
                                <div className="lg:w-1/2 space-y-8">
                                    <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                                        {sections.hero.title}
                                    </h1>
                                    <p className="text-xl text-gray-600 leading-relaxed">
                                        {sections.hero.subtitle}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href={route('register')}
                                            className="inline-flex justify-center items-center px-8 py-4 bg-primary-600 border border-transparent rounded-full font-bold text-lg text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                        >
                                            {sections.hero.cta_text}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="lg:w-1/2 relative">
                                    <div className="absolute inset-0 bg-primary-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                                    <img
                                        src={sections.hero.image_url}
                                        alt="Dashboard Preview"
                                        className="relative rounded-2xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-all duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Features Section */}
                {sections?.features && (
                    <section className="py-24 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                    {sections.features.title}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {sections.features.items?.map((item, index) => (
                                    <div key={index} className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                                        <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                            {getIcon(item.icon)}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Testimonials Section */}
                {sections?.testimonials && (
                    <section className="py-24 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
                                {sections.testimonials.title}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                {sections.testimonials.items?.map((item, index) => (
                                    <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img
                                                src={item.avatar}
                                                alt={item.name}
                                                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-100"
                                            />
                                            <div>
                                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-primary-600 font-medium">{item.role}</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gray-100 -z-10" />
                                            <p className="text-gray-600 italic relative z-10">
                                                "{item.quote}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Footer */}
                {sections?.cta_footer && (
                    <section className="py-24 bg-primary-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                {sections.cta_footer.title}
                            </h2>
                            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
                                {sections.cta_footer.subtitle}
                            </p>
                            <Link
                                href={route('register')}
                                className="inline-flex items-center px-8 py-4 bg-white text-primary-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                {sections.cta_footer.button_text}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </section>
                )}

                {/* Simple Footer */}
                <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <ApplicationLogo className="h-6 w-6 text-gray-500 fill-current" />
                            <span className="font-semibold text-gray-300">
                                {system_settings?.app_name || 'Finanças'}
                            </span>
                        </div>
                        <p className="text-sm">
                            © {new Date().getFullYear()} Todos os direitos reservados.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
