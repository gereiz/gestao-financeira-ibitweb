<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect($provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            abort(404);
        }

        $this->setConfig($provider);
        return Socialite::driver($provider)->redirect();
    }

    public function callback($provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            abort(404);
        }

        $this->setConfig($provider);
        
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Erro ao autenticar com ' . ucfirst($provider));
        }

        // Check if user exists with this email
        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // Update social ID if not present
            if ($provider === 'google' && !$user->google_id) {
                $user->update(['google_id' => $socialUser->getId()]);
            }
            if ($provider === 'facebook' && !$user->facebook_id) {
                $user->update(['facebook_id' => $socialUser->getId()]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'password' => bcrypt(Str::random(16)),
                'email_verified_at' => now(),
                'avatar' => $socialUser->getAvatar(),
                'google_id' => $provider === 'google' ? $socialUser->getId() : null,
                'facebook_id' => $provider === 'facebook' ? $socialUser->getId() : null,
            ]);
        }

        Auth::login($user);

        return redirect()->intended(route('dashboard'));
    }

    private function setConfig($provider)
    {
        $clientId = SystemSetting::get($provider . '_client_id');
        $clientSecret = SystemSetting::get($provider . '_client_secret');
        
        if (!$clientId || !$clientSecret) {
            abort(500, 'Credenciais do ' . ucfirst($provider) . ' não configuradas.');
        }

        config([
            "services.$provider.client_id" => $clientId,
            "services.$provider.client_secret" => $clientSecret,
            "services.$provider.redirect" => route('social.callback', $provider),
        ]);
    }
}
