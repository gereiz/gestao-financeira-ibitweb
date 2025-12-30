<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentGatewayController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Gateways/Index', [
            'settings' => [
                'mercadopago_public_key' => $settings['mercadopago_public_key'] ?? '',
                'mercadopago_access_token' => $settings['mercadopago_access_token'] ?? '',
                'mercadopago_active' => filter_var($settings['mercadopago_active'] ?? false, FILTER_VALIDATE_BOOLEAN),
            ]
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'mercadopago_public_key' => 'nullable|string',
            'mercadopago_access_token' => 'nullable|string',
            'mercadopago_active' => 'boolean',
        ]);

        SystemSetting::set('mercadopago_public_key', $validated['mercadopago_public_key']);
        SystemSetting::set('mercadopago_access_token', $validated['mercadopago_access_token']);
        SystemSetting::set('mercadopago_active', $validated['mercadopago_active'] ? 'true' : 'false');

        return redirect()->back()->with('success', 'Configurações do gateway atualizadas com sucesso!');
    }
}
