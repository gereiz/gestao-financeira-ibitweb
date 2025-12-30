<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\PlansPageSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PricingController extends Controller
{
    public function index()
    {
        $plans = Plan::with('features')->where('is_active', true)->get();
        $sections = PlansPageSection::where('is_visible', true)->get()->keyBy('key');

        return Inertia::render('Pricing/Index', [
            'plans' => $plans,
            'hero' => $sections->get('hero')?->content,
            'faq' => $sections->get('faq')?->content,
        ]);
    }
}
