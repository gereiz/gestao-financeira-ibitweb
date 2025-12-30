<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'color',
        'icon',
        'is_system',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        // Escopo Global: Usuário vê suas categorias + categorias do sistema
        static::addGlobalScope('tenant_and_system', function ($builder) {
            if (auth()->check()) {
                $builder->where(function($query) {
                    $query->where('categories.user_id', auth()->id())
                          ->orWhere('categories.is_system', true);
                });
            }
        });

        // Auto-fill user_id na criação
        static::creating(function ($model) {
            if (auth()->check()) {
                // Se não foi definido explicitamente (ex: pelo Admin criando sistema)
                if ($model->is_system) {
                    $model->user_id = null;
                } elseif (empty($model->user_id)) {
                    $model->user_id = auth()->id();
                }
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
