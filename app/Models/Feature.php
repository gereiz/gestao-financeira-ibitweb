<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feature extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'plan_id',
        'name',
        'slug',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Retorna a lista de todas as features disponíveis no sistema.
     * Isso garante uma única fonte da verdade para o PlanController e Seeders.
     */
    public static function getAvailableFeatures()
    {
        return [
            'future_transactions' => 'Lançamentos Futuros',
            'notifications' => 'Notificações',
            'advanced_reports' => 'Relatórios Avançados',
            'advanced_charts' => 'Ver Gráficos Avançados',
            'access_categories' => 'Acessar Categorias',
            'create_custom_cards' => 'Criar Cards Personalizados',
        ];
    }
}
