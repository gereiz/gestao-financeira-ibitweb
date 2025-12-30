<?php

namespace App\Http\Controllers;

use App\Models\LandingPageSection;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $sections = LandingPageSection::where('is_visible', true)
            ->get()
            ->keyBy('key')
            ->map(function ($section) {
                return $section->content;
            });

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'sections' => $sections,
        ]);
    }
}
