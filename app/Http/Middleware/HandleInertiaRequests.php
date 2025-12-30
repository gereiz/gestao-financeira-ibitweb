<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
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
        $settings = SystemSetting::all()->pluck('value', 'key')->toArray();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->toArray(),
                    'features' => $request->user()->is_admin 
                        ? ['future_transactions', 'notifications', 'advanced_reports'] 
                        : ($request->user()->plan ? $request->user()->plan->features->where('is_enabled', true)->pluck('slug')->values()->all() : [])
                ] : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'system_settings' => [
                'app_name' => $settings['app_name'] ?? config('app.name'),
                'logo_path' => $settings['logo_path'] ?? null,
                'primary_color' => $settings['primary_color'] ?? '#4F46E5', // Default Indigo-600
                'font_family' => $settings['font_family'] ?? 'Inter',
                'google_auth_enabled' => !empty($settings['google_client_id']) && !empty($settings['google_client_secret']),
                'facebook_auth_enabled' => !empty($settings['facebook_client_id']) && !empty($settings['facebook_client_secret']),
            ],
        ];
    }
}
