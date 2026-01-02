<?php

use App\Models\Feature;
use App\Models\Plan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $premiumPlan = Plan::where('slug', 'premium')->first();

        if ($premiumPlan) {
            Feature::firstOrCreate(
                ['plan_id' => $premiumPlan->id, 'slug' => 'advanced_charts'],
                [
                    'name' => 'Ver Gráficos Avançados',
                    'is_enabled' => true,
                ]
            );
            
            // Também adicionar a feature de criação de cards customizados (create_custom_cards) se não existir
            // pois ela foi usada em controllers anteriormente mas não estava explícita no seeder
            Feature::firstOrCreate(
                ['plan_id' => $premiumPlan->id, 'slug' => 'create_custom_cards'],
                [
                    'name' => 'Criar Cards Personalizados',
                    'is_enabled' => true,
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $premiumPlan = Plan::where('slug', 'premium')->first();
        if ($premiumPlan) {
            Feature::where('plan_id', $premiumPlan->id)
                   ->whereIn('slug', ['advanced_charts', 'create_custom_cards'])
                   ->delete();
        }
    }
};
