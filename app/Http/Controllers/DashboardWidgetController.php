<?php

namespace App\Http\Controllers;

use App\Models\DashboardWidget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardWidgetController extends Controller
{
    public function store(Request $request)
    {
        if (!Auth::user()->hasFeature('create_custom_cards')) {
            abort(403, 'Upgrade your plan to create custom cards.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'filters' => 'nullable|array',
        ]);

        $widget = Auth::user()->dashboardWidgets()->create($validated);

        // Add to layout preferences
        $user = Auth::user();
        $preferences = $user->preferences ?? [];
        $layout = $preferences['dashboard_layout'] ?? ['balance', 'income', 'expense', 'chart_income', 'chart_expense'];
        $layout[] = "widget_{$widget->id}";
        $preferences['dashboard_layout'] = $layout;
        $user->update(['preferences' => $preferences]);

        return back()->with('success', 'Widget criado com sucesso!');
    }

    public function destroy(DashboardWidget $widget)
    {
        if ($widget->user_id !== Auth::id()) {
            abort(403);
        }

        $widgetId = "widget_{$widget->id}";
        $widget->delete();

        // Remove from preferences
        $user = Auth::user();
        $preferences = $user->preferences ?? [];
        if (isset($preferences['dashboard_layout'])) {
            $preferences['dashboard_layout'] = array_values(array_filter($preferences['dashboard_layout'], function($id) use ($widgetId) {
                return $id !== $widgetId;
            }));
            $user->update(['preferences' => $preferences]);
        }

        return back()->with('success', 'Widget removido com sucesso!');
    }
    
    public function updateOrder(Request $request)
    {
        $request->validate([
            'layout' => 'required|array',
        ]);

        $user = Auth::user();
        $preferences = $user->preferences ?? [];
        $preferences['dashboard_layout'] = $request->layout;
        
        $user->update(['preferences' => $preferences]);
        
        return back();
    }
}
