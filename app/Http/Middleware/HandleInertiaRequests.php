<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        try {
            $settings = SystemSetting::all()->pluck('value', 'key')->toArray();
        } catch (\Exception $e) {
            $settings = [];
        }

        $logoPath = $settings['logo_path'] ?? null;
        if ($logoPath) {
             $logoPath = str_replace('http://localhost/storage/', '', $logoPath);
             $logoPath = str_replace(config('app.url').'/storage/', '', $logoPath);
             if (!str_starts_with($logoPath, 'http')) {
                 $logoPath = Storage::url($logoPath);
             }
        }

        $faviconPath = $settings['favicon_path'] ?? null;
        if ($faviconPath && !str_starts_with($faviconPath, 'http')) {
             $faviconPath = Storage::url($faviconPath);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? array_merge(
                    $request->user()->load('plan')->toArray(),
                    [
                        'features' => $request->user()->is_admin 
                            ? ['future_transactions', 'notifications', 'advanced_reports', 'access_categories', 'create_custom_cards'] 
                            : ($request->user()->plan ? $request->user()->plan->features->where('is_enabled', true)->pluck('slug')->values()->all() : [])
                    ]
                ) : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'system_settings' => [
                'app_name' => $settings['app_name'] ?? config('app.name'),
                'logo_path' => $logoPath,
                'favicon_path' => $faviconPath,
                'primary_color' => $settings['primary_color'] ?? '#4F46E5', // Default Indigo-600
                'font_family' => $settings['font_family'] ?? 'Inter',
                'google_auth_enabled' => !empty($settings['google_client_id']) && !empty($settings['google_client_secret']),
                'facebook_auth_enabled' => !empty($settings['facebook_client_id']) && !empty($settings['facebook_client_secret']),
            ],
        ];
    }
}
