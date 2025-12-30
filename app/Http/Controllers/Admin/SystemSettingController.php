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
        ]);

        // Save Text Settings
        SystemSetting::set('app_name', $request->app_name);
        SystemSetting::set('primary_color', $request->primary_color);
        SystemSetting::set('font_family', $request->font_family);

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $url = Storage::disk('public')->url($path);
            SystemSetting::set('logo_path', $url);
        }

        return redirect()->back()->with('success', 'Configurações atualizadas com sucesso!');
    }
}
