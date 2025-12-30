import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Hooks/useTheme';
import { 
    LayoutDashboard, 
    ArrowRightLeft, 
    Tags, 
    LogOut, 
    Sun, 
    Moon, 
    Menu, 
    X,
    Settings,
    BarChart3,
    CreditCard,
    Users,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, system_settings } = usePage().props;
    const user = auth.user;
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const toggleSubmenu = (name) => {
        setOpenSubmenu(openSubmenu === name ? null : name);
    };

    const menuItems = [
        { name: 'Dashboard', route: 'dashboard', active: 'dashboard', icon: LayoutDashboard },
        { name: 'Transações', route: 'transactions.index', active: 'transactions.*', icon: ArrowRightLeft },
        { name: 'Categorias', route: 'categories.index', active: 'categories.*', icon: Tags },
        { name: 'Relatórios', route: 'reports.index', active: 'reports.*', icon: BarChart3 },
    ];

    if (user.is_admin) {
        menuItems.push({ name: 'Usuários', route: 'admin.users.index', active: 'admin.users.*', icon: Users });
        menuItems.push({ name: 'Planos', route: 'admin.plans.index', active: 'admin.plans.*', icon: CreditCard });
        
        menuItems.push({
            name: 'Configurações',
            icon: Settings,
            active: ['admin.settings.*', 'admin.gateways.*', 'admin.site.*'],
            children: [
                { name: 'Config do Sistema', route: 'admin.settings.edit', active: 'admin.settings.*' },
                { name: 'Site (Landing Page)', route: 'admin.site.index', active: 'admin.site.*' },
                { name: 'Gateway de Pagamento', route: 'admin.gateways.index', active: 'admin.gateways.*' },
            ]
        });
    }

    const isActive = (pattern) => {
        if (Array.isArray(pattern)) {
            return pattern.some(p => route().current(p));
        }
        return route().current(pattern);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <Link href={route('dashboard')}>
                    <ApplicationLogo className="h-8 w-auto fill-current text-primary-600" />
                </Link>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
                        <Link href={route('dashboard')} className="flex items-center gap-2">
                            <ApplicationLogo className="h-8 w-8 fill-current text-primary-600" />
                            <span className="text-xl font-bold text-gray-800 dark:text-white">
                                {system_settings?.app_name || 'Finanças'}
                            </span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => (
                            <div key={item.name}>
                                {item.children ? (
                                    <>
                                        <button
                                            onClick={() => toggleSubmenu(item.name)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-colors ${
                                                isActive(item.active)
                                                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={20} />
                                                {item.name}
                                            </div>
                                            {(openSubmenu === item.name || isActive(item.active)) ? (
                                                <ChevronDown size={16} />
                                            ) : (
                                                <ChevronRight size={16} />
                                            )}
                                        </button>
                                        {(openSubmenu === item.name || isActive(item.active)) && (
                                            <div className="pl-11 pr-4 py-2 space-y-2">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={route(child.route)}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={`block py-2 text-sm font-medium transition-colors ${
                                                            isActive(child.active)
                                                                ? 'text-primary-600 dark:text-primary-400'
                                                                : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                                                        }`}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={route(item.route)}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-colors ${
                                            isActive(item.active)
                                                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <item.icon size={20} />
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Link 
                                    href={route('profile.edit')} 
                                    className="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity"
                                    title="Editar Perfil"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex-shrink-0 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
                                    </div>
                                </Link>
                            </div>
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        >
                            <LogOut size={18} />
                            Sair
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen p-4 lg:p-8 pt-6">
                {header && (
                    <header className="mb-6 lg:mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{header}</h1>
                    </header>
                )}
                {children}
            </main>
        </div>
    );
}
