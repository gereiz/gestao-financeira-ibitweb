<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class SystemCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income
            ['name' => 'Salário', 'type' => 'income', 'color' => '#10B981', 'icon' => 'dollar-sign'],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#3B82F6', 'icon' => 'briefcase'],
            ['name' => 'Investimentos', 'type' => 'income', 'color' => '#8B5CF6', 'icon' => 'trending-up'],
            
            // Expense
            ['name' => 'Alimentação', 'type' => 'expense', 'color' => '#EF4444', 'icon' => 'shopping-cart'],
            ['name' => 'Transporte', 'type' => 'expense', 'color' => '#F59E0B', 'icon' => 'truck'],
            ['name' => 'Moradia', 'type' => 'expense', 'color' => '#6366F1', 'icon' => 'home'],
            ['name' => 'Saúde', 'type' => 'expense', 'color' => '#EC4899', 'icon' => 'heart'],
            ['name' => 'Educação', 'type' => 'expense', 'color' => '#14B8A6', 'icon' => 'book'],
            ['name' => 'Lazer', 'type' => 'expense', 'color' => '#F97316', 'icon' => 'smile'],
        ];

        foreach ($categories as $cat) {
            Category::withoutGlobalScopes()->updateOrCreate(
                ['name' => $cat['name']], // Busca pelo nome
                array_merge($cat, ['is_system' => true, 'user_id' => null])
            );
        }
    }
}
