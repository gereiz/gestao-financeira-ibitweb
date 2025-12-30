<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if (!$user->hasFeature('access_categories')) {
            return Inertia::render('Categories/Index', [
                'categories' => [],
                'hasAccess' => false
            ]);
        }

        $categories = Category::orderBy('is_system', 'desc')
            ->orderBy('name')
            ->get();
            
        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'hasAccess' => true
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
