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
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('categories', CategoryController::class);
    Route::resource('transactions', TransactionController::class);
    
    // Widgets Routes
    Route::post('/dashboard/widgets', [DashboardWidgetController::class, 'store'])->name('dashboard.widgets.store');
    Route::delete('/dashboard/widgets/{widget}', [DashboardWidgetController::class, 'destroy'])->name('dashboard.widgets.destroy');
    Route::post('/dashboard/layout', [DashboardWidgetController::class, 'updateOrder'])->name('dashboard.layout.update');

    // Reports Route
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
});

// Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/settings', [SystemSettingController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [SystemSettingController::class, 'update'])->name('settings.update');
    
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

require __DIR__.'/auth.php';
