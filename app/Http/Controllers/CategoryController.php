<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user->hasFeature('access_categories')) {
            return Inertia::render('Categories/Index', [
                'categories' => [],
                'hasAccess' => false
            ]);
        }

        $type = $request->input('type', 'all');

        $query = Category::orderBy('is_system', 'desc')
            ->orderBy('name');

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        $categories = $query->get();
            
        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'hasAccess' => true,
            'filters' => [
                'type' => $type
            ]
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasFeature('access_categories')) {
            abort(403, 'Upgrade your plan to access this feature.');
        }
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasFeature('access_categories')) {
            abort(403, 'Upgrade your plan to access this feature.');
        }
        
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $exists = Category::where('name', $value)
                        ->where(function ($query) {
                            $query->where('user_id', auth()->id())
                                  ->orWhere('is_system', true);
                        })
                        ->exists();

                    if ($exists) {
                        $fail('Já existe uma categoria com este nome.');
                    }
                },
            ],
            'type' => 'required|in:income,expense',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
        ]);

        Category::create($validated);

        return redirect()->route('categories.index');
    }

    public function edit(Category $category)
    {
        if (!auth()->user()->hasFeature('access_categories')) {
            abort(403, 'Upgrade your plan to access this feature.');
        }

        if ($category->is_system && !auth()->user()->is_admin) {
            abort(403, 'Você não pode editar categorias do sistema.');
        }

        return Inertia::render('Categories/Edit', ['category' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        if (!auth()->user()->hasFeature('access_categories')) {
            abort(403, 'Upgrade your plan to access this feature.');
        }

        if ($category->is_system && !auth()->user()->is_admin) {
            abort(403, 'Você não pode editar categorias do sistema.');
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($category) {
                    $exists = Category::where('name', $value)
                        ->where('id', '!=', $category->id)
                        ->where(function ($query) {
                            $query->where('user_id', auth()->id())
                                  ->orWhere('is_system', true);
                        })
                        ->exists();

                    if ($exists) {
                        $fail('Já existe uma categoria com este nome.');
                    }
                },
            ],
            'type' => 'required|in:income,expense',
            'color' => 'required|string|max:7',
            'icon' => 'nullable|string|max:50',
        ]);

        $category->update($validated);

        return redirect()->route('categories.index');
    }

    public function destroy(Category $category)
    {
        if (!auth()->user()->hasFeature('access_categories')) {
            abort(403, 'Upgrade your plan to access this feature.');
        }

        if ($category->is_system) {
            abort(403, 'Você não pode excluir categorias do sistema.');
        }

        if ($category->user_id !== auth()->id()) {
            abort(403, 'Você não tem permissão para excluir esta categoria.');
        }

        $category->delete();

        return redirect()->route('categories.index');
    }
}
