<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Free Plan
        $freePlan = Plan::firstOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Gratuito',
                'price' => 0.00,
                'billing_period' => 'monthly',
                'max_transactions' => 50,
                'is_active' => true,
            ]
        );

        // Premium Plan
        $premiumPlan = Plan::firstOrCreate(
            ['slug' => 'premium'],
            [
                'name' => 'Premium',
                'price' => 29.90,
                'billing_period' => 'monthly',
                'max_transactions' => 999999,
                'is_active' => true,
            ]
        );

        // Define Features
        $features = [
            'future_transactions' => 'Lançamentos Futuros',
            'notifications' => 'Notificações',
            'advanced_reports' => 'Relatórios Avançados',
        ];

        // Assign Features to Plans
        // Free Plan: No advanced features
        // (You can add basic features if needed)

        // Premium Plan: All Features
        foreach ($features as $slug => $name) {
            Feature::firstOrCreate(
                ['plan_id' => $premiumPlan->id, 'slug' => $slug],
                [
                    'name' => $name,
                    'is_enabled' => true,
                ]
            );
        }
    }
}
