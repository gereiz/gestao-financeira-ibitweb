<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlansPageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'content',
        'is_visible',
    ];

    protected $casts = [
        'content' => 'array',
        'is_visible' => 'boolean',
    ];
}
