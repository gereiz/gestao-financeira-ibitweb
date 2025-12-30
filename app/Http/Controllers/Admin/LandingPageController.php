<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    public function index()
    {
        $sections = LandingPageSection::all();

        return Inertia::render('Admin/Site/Index', [
            'sections' => $sections,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:landing_page_sections,id',
            'sections.*.content' => 'required|array',
            'sections.*.is_visible' => 'boolean',
        ]);

        foreach ($request->sections as $sectionData) {
            $section = LandingPageSection::find($sectionData['id']);
            $section->update([
                'content' => $sectionData['content'],
                'is_visible' => $sectionData['is_visible'],
            ]);
        }

        return redirect()->back()->with('success', 'Configurações do site atualizadas com sucesso.');
    }
}
