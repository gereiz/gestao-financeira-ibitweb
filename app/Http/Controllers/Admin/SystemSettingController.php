<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function edit()
    {
        // Get all settings as key-value pairs
        $settings = SystemSetting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings', [
            'settings' => [
                'app_name' => $settings['app_name'] ?? config('app.name'),
                'logo_path' => $settings['logo_path'] ?? null,
                'primary_color' => $settings['primary_color'] ?? '#000000',
                'font_family' => $settings['font_family'] ?? 'Inter',
                'google_client_id' => $settings['google_client_id'] ?? '',
                'google_client_secret' => $settings['google_client_secret'] ?? '',
                'facebook_client_id' => $settings['facebook_client_id'] ?? '',
                'facebook_client_secret' => $settings['facebook_client_secret'] ?? '',
                'mercadopago_access_token' => $settings['mercadopago_access_token'] ?? '',
                'mercadopago_public_key' => $settings['mercadopago_public_key'] ?? '',
            ]
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:1024', // 1MB max
            'primary_color' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'font_family' => 'required|string|max:100',
            'google_client_id' => 'nullable|string',
            'google_client_secret' => 'nullable|string',
            'facebook_client_id' => 'nullable|string',
            'facebook_client_secret' => 'nullable|string',
            'mercadopago_access_token' => 'nullable|string',
            'mercadopago_public_key' => 'nullable|string',
        ]);

        // Save Text Settings
        SystemSetting::set('app_name', $request->app_name);
        SystemSetting::set('primary_color', $request->primary_color);
        SystemSetting::set('font_family', $request->font_family);
        SystemSetting::set('google_client_id', $request->google_client_id);
        SystemSetting::set('google_client_secret', $request->google_client_secret);
        SystemSetting::set('facebook_client_id', $request->facebook_client_id);
        SystemSetting::set('facebook_client_secret', $request->facebook_client_secret);
        SystemSetting::set('mercadopago_access_token', $request->mercadopago_access_token);
        SystemSetting::set('mercadopago_public_key', $request->mercadopago_public_key);

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $url = Storage::disk('public')->url($path);
            SystemSetting::set('logo_path', $url);
        }

        return redirect()->back()->with('success', 'Configurações atualizadas com sucesso!');
    }
}
