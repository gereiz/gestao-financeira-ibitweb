<?php

use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\PaymentGatewayController;
use App\Http\Controllers\Admin\SystemSettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\LandingPageController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardWidgetController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\Admin\PlansPageController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\WebhookController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InstallController;

// Rotas de Instalação (Abertas)
Route::get('/install', [InstallController::class, 'index'])->name('install.index');
Route::post('/install/test', [InstallController::class, 'testConnection'])->name('install.test');
Route::post('/install/store', [InstallController::class, 'store'])->name('install.store');

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/planos', [PricingController::class, 'index'])->name('pricing.index');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('categories', CategoryController::class);
    Route::resource('transactions', TransactionController::class);
    
    // Widgets Routes
    Route::post('/dashboard/widgets', [DashboardWidgetController::class, 'store'])->name('dashboard.widgets.store');
    Route::patch('/dashboard/widgets/{widget}', [DashboardWidgetController::class, 'update'])->name('dashboard.widgets.update');
    Route::delete('/dashboard/widgets/{widget}', [DashboardWidgetController::class, 'destroy'])->name('dashboard.widgets.destroy');
    Route::post('/dashboard/layout', [DashboardWidgetController::class, 'updateOrder'])->name('dashboard.layout.update');
    Route::post('/dashboard/layout/reset', [DashboardController::class, 'resetLayout'])->name('dashboard.layout.reset');
    Route::post('/dashboard/card/width', [DashboardController::class, 'updateCardWidth'])->name('dashboard.card.width');

    // Reports Route
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
});

// Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Route to fix storage link in production
    Route::get('/fix-storage', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('storage:link');
            return redirect()->back()->with('success', 'Link de armazenamento corrigido com sucesso! As imagens devem aparecer agora.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao corrigir storage: ' . $e->getMessage());
        }
    })->name('fix-storage');

    Route::get('/settings', [SystemSettingController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [SystemSettingController::class, 'update'])->name('settings.update');
    
    // Plans Page Settings
    Route::get('/settings/plans-page', [PlansPageController::class, 'index'])->name('plans-page.index');
    Route::post('/settings/plans-page', [PlansPageController::class, 'update'])->name('plans-page.update');
    
    // Payment Gateways
    Route::get('/gateways', [PaymentGatewayController::class, 'index'])->name('gateways.index');
    Route::post('/gateways', [PaymentGatewayController::class, 'update'])->name('gateways.update');

    // Plans Management
    Route::resource('plans', PlanController::class);

    // Users Management
    Route::resource('users', UserController::class)->only(['index', 'edit', 'update']);

    // Site Settings
    Route::get('/settings/site', [LandingPageController::class, 'index'])->name('site.index');
    Route::post('/settings/site', [LandingPageController::class, 'update'])->name('site.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Social Authentication Routes
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])->name('social.callback');

// Checkout Routes
Route::middleware(['auth'])->group(function () {
    Route::post('/checkout/check-status', [CheckoutController::class, 'checkStatus'])->name('checkout.check_status');
    Route::post('/checkout/{plan}', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/checkout/success', [CheckoutController::class, 'success'])->name('checkout.success');
    Route::get('/checkout/failure', [CheckoutController::class, 'failure'])->name('checkout.failure');
    Route::get('/checkout/pending', [CheckoutController::class, 'pending'])->name('checkout.pending');
});

// Webhook Routes
Route::post('/webhook/mercadopago', [WebhookController::class, 'handleMercadoPago'])->name('webhook.mercadopago');

require __DIR__.'/auth.php';
