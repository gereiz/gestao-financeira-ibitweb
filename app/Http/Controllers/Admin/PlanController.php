<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PlanController extends Controller
{
    private $availableFeatures = [
        'future_transactions' => 'Lançamentos Futuros',
        'notifications' => 'Notificações',
        'advanced_reports' => 'Relatórios Avançados',
        'access_categories' => 'Acessar Categorias',
        'create_custom_cards' => 'Criar Cards Personalizados',
    ];

    public function index()
    {
        $plans = Plan::with('features')->get();
        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Plans/Create', [
            'availableFeatures' => $this->availableFeatures
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:monthly,quarterly,semiannual,yearly',
            'max_transactions' => 'required|integer|min:-1',
            'features' => 'array',
            'is_featured' => 'boolean',
            'is_recurring' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = true;
        
        // Se for recorrente, criar no Mercado Pago
        if (!empty($validated['is_recurring']) && $validated['is_recurring']) {
            $mpPlanId = $this->createMercadoPagoPlan($validated);
            if ($mpPlanId) {
                $validated['mercadopago_plan_id'] = $mpPlanId;
            } else {
                return back()->withErrors(['error' => 'Falha ao criar plano recorrente no Mercado Pago. Verifique os logs ou a configuração do token.']);
            }
        }

        $plan = Plan::create($validated);

        // Sync Features
        if (isset($validated['features'])) {
            foreach ($validated['features'] as $slug) {
                if (array_key_exists($slug, $this->availableFeatures)) {
                    Feature::create([
                        'plan_id' => $plan->id,
                        'name' => $this->availableFeatures[$slug],
                        'slug' => $slug,
                        'is_enabled' => true,
                    ]);
                }
            }
        }

        return redirect()->route('admin.plans.index')->with('success', 'Plano criado com sucesso!');
    }

    public function edit(Plan $plan)
    {
        $plan->load('features');
        
        return Inertia::render('Admin/Plans/Edit', [
            'plan' => $plan,
            'availableFeatures' => $this->availableFeatures,
            'planFeatures' => $plan->features->pluck('slug')->toArray()
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:monthly,quarterly,semiannual,yearly',
            'max_transactions' => 'required|integer|min:-1',
            'features' => 'array',
            'is_featured' => 'boolean',
            'is_recurring' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        // Verifica mudança de status recorrente ou necessidade de atualização no MP
        if (!empty($validated['is_recurring']) && $validated['is_recurring']) {
            // Em ambiente local, forçamos a recriação do plano para garantir que a back_url (google.com) seja aplicada corretamente
            // ou se o plano não tiver ID ainda.
            if (app()->environment('local') || !$plan->mercadopago_plan_id) {
                $mpPlanId = $this->createMercadoPagoPlan($validated);
                if ($mpPlanId) {
                    $validated['mercadopago_plan_id'] = $mpPlanId;
                } else {
                    return back()->withErrors(['error' => 'Falha ao criar plano recorrente no Mercado Pago. Verifique os logs.']);
                }
            } else {
                // Em produção, tentamos atualizar
                $this->updateMercadoPagoPlan($plan->mercadopago_plan_id, $validated);
            }
        }

        $plan->update($validated);

        // Sync Features: Delete all and recreate (simple approach)
        $plan->features()->delete();
        
        if (isset($validated['features'])) {
            foreach ($validated['features'] as $slug) {
                if (array_key_exists($slug, $this->availableFeatures)) {
                    Feature::create([
                        'plan_id' => $plan->id,
                        'name' => $this->availableFeatures[$slug],
                        'slug' => $slug,
                        'is_enabled' => true,
                    ]);
                }
            }
        }

        return redirect()->route('admin.plans.index')->with('success', 'Plano atualizado com sucesso!');
    }

    public function destroy(Plan $plan)
    {
        // Check if plan has users
        if ($plan->users()->count() > 0) {
            return back()->withErrors(['error' => 'Não é possível excluir um plano que possui usuários ativos.']);
        }

        // Se for um plano recorrente e tiver ID do Mercado Pago, tenta cancelar lá também
        if ($plan->is_recurring && $plan->mercadopago_plan_id) {
            $this->cancelMercadoPagoPlan($plan->mercadopago_plan_id);
        }

        $plan->delete();
        return redirect()->route('admin.plans.index')->with('success', 'Plano excluído com sucesso!');
    }

    private function cancelMercadoPagoPlan($id)
    {
        $accessToken = SystemSetting::get('mercadopago_access_token');
        if (!$accessToken) return;

        try {
            // Mercado Pago não tem endpoint DELETE para planos, mas podemos atualizar status para cancelled
            // Verifique a documentação oficial, geralmente é PUT com status
            $payload = ['status' => 'cancelled'];
            
            $response = Http::withToken($accessToken)->put("https://api.mercadopago.com/preapproval_plan/{$id}", $payload);
            
            if ($response->successful()) {
                Log::info('MercadoPago Plan Cancelled', ['id' => $id]);
            } else {
                Log::warning('MercadoPago Plan Cancel Failed', ['id' => $id, 'body' => $response->body()]);
            }
        } catch (\Exception $e) {
            Log::error('MP Plan Cancel Exception: ' . $e->getMessage());
        }
    }

    private function createMercadoPagoPlan($data)
    {
        $accessToken = SystemSetting::get('mercadopago_access_token');
        if (!$accessToken) return null;

        $frequency = 1;
        $frequencyType = 'months';

        switch ($data['billing_period']) {
            case 'monthly': $frequency = 1; $frequencyType = 'months'; break;
            case 'quarterly': $frequency = 3; $frequencyType = 'months'; break;
            case 'semiannual': $frequency = 6; $frequencyType = 'months'; break;
            case 'yearly': $frequency = 12; $frequencyType = 'months'; break;
        }

        // Mercado Pago API requires a valid public URL. Localhost is often rejected.
        $backUrl = route('checkout.success');
        if (app()->environment('local') && (str_contains($backUrl, 'localhost') || str_contains($backUrl, '127.0.0.1') || str_contains($backUrl, '.test'))) {
            // Use a dummy valid URL for local development to pass API validation
            $backUrl = 'https://www.google.com';
            Log::warning('Using dummy back_url for Mercado Pago Plan creation due to localhost environment.');
        }

        $payload = [
            'reason' => $data['name'],
            'auto_recurring' => [
                'frequency' => $frequency,
                'frequency_type' => $frequencyType,
                'transaction_amount' => (float) $data['price'],
                'currency_id' => 'BRL',
            ],
            'back_url' => $backUrl,
            'status' => 'active',
        ];

        try {
            $response = Http::withToken($accessToken)->post('https://api.mercadopago.com/preapproval_plan', $payload);
            
            if ($response->successful()) {
                return $response->json()['id'];
            }
            
            Log::error('MP Plan Create Error', ['body' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('MP Plan Create Exception: ' . $e->getMessage());
        }

        return null;
    }

    private function updateMercadoPagoPlan($id, $data)
    {
        $accessToken = SystemSetting::get('mercadopago_access_token');
        if (!$accessToken) return;

        // Mercado Pago API requires a valid public URL. Localhost is often rejected.
        $backUrl = route('checkout.success');

        // Ensure HTTPS in production/non-local environments
        if (!app()->environment('local') && str_starts_with($backUrl, 'http://')) {
            $backUrl = str_replace('http://', 'https://', $backUrl);
        }

        if (app()->environment('local') && (str_contains($backUrl, 'localhost') || str_contains($backUrl, '127.0.0.1') || str_contains($backUrl, '.test'))) {
            // Use a dummy valid URL for local development to pass API validation
            $backUrl = 'https://www.google.com';
        }

        Log::info('Updating MercadoPago Plan', ['id' => $id, 'back_url' => $backUrl]);

        $payload = [
            'reason' => $data['name'],
            'back_url' => $backUrl,
            // 'auto_recurring' => [ ... ] // MP often restricts updating recurring details on active plans with subscribers
        ];

        try {
            Http::withToken($accessToken)->put("https://api.mercadopago.com/preapproval_plan/{$id}", $payload);
        } catch (\Exception $e) {
            Log::error('MP Plan Update Exception: ' . $e->getMessage());
        }
    }
}
