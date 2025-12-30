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
            'sections.*.content.image_file' => 'nullable|image|max:2048', // Validação para upload de imagem
        ]);

        foreach ($request->sections as $index => $sectionData) {
            $section = LandingPageSection::find($sectionData['id']);
            $content = $sectionData['content'];

            // Processar upload de imagem (Hero section)
            if ($request->hasFile("sections.{$index}.content.image_file")) {
                $file = $request->file("sections.{$index}.content.image_file");
                $path = $file->store('landing-page', 'public');
                $content['image_url'] = '/storage/' . $path;
                unset($content['image_file']); // Remover o arquivo do array de conteúdo
            }

            $section->update([
                'content' => $content,
                'is_visible' => $sectionData['is_visible'],
            ]);
        }

        return redirect()->back()->with('success', 'Configurações do site atualizadas com sucesso.');
    }
}
