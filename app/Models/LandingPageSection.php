<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPageSection extends Model
{
    protected $fillable = ['key', 'content', 'is_visible'];

    protected $casts = [
        'content' => 'array',
        'is_visible' => 'boolean',
    ];
}
