<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PlanController extends Controller
{
    private $availableFeatures = [
        'future_transactions' => 'Lançamentos Futuros',
        'notifications' => 'Notificações',
        'advanced_reports' => 'Relatórios Avançados',
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
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:monthly,quarterly,semiannual,yearly',
            'max_transactions' => 'required|integer|min:-1',
            'features' => 'array',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_active'] = true;

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
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:monthly,quarterly,semiannual,yearly',
            'max_transactions' => 'required|integer|min:-1',
            'features' => 'array',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
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

        $plan->delete();
        return redirect()->route('admin.plans.index')->with('success', 'Plano excluído com sucesso!');
    }
}
