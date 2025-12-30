<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlansPageSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlansPageController extends Controller
{
    public function index()
    {
        $sections = PlansPageSection::all();

        return Inertia::render('Admin/PlansPage/Index', [
            'sections' => $sections,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|exists:plans_page_sections,id',
            'sections.*.content' => 'required|array',
            'sections.*.is_visible' => 'boolean',
        ]);

        foreach ($request->sections as $sectionData) {
            $section = PlansPageSection::find($sectionData['id']);
            $section->update([
                'content' => $sectionData['content'],
                'is_visible' => $sectionData['is_visible'],
            ]);
        }

        return redirect()->back()->with('success', 'Configurações da página de planos atualizadas com sucesso.');
    }
}
