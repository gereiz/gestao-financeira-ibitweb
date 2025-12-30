<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Admin Dashboard Logic
        if ($user->is_admin) {
            $totalUsers = \App\Models\User::count();
            $usersByPlan = \App\Models\Plan::withCount('users')->get();
            $recentUsers = \App\Models\User::latest()->take(5)->get();
            $activeUsers = \App\Models\User::where('is_active', true)->count();

            return Inertia::render('Dashboard', [
                'isAdmin' => true,
                'adminStats' => [
                    'totalUsers' => $totalUsers,
                    'usersByPlan' => $usersByPlan,
                    'recentUsers' => $recentUsers,
                    'activeUsers' => $activeUsers,
                ],
                'layout' => $user->preferences['dashboard_layout'] ?? [], // Admin might have their own layout preferences
                'categories' => Category::all(), // Needed for layout compatibility if admin wants to see charts
                // Provide empty/default values for user props to avoid errors if the component expects them
                'summary' => ['income' => 0, 'expense' => 0, 'balance' => 0],
                'charts' => ['incomeByCategory' => [], 'expenseByCategory' => []],
                'widgets' => [],
            ]);
        }
        
        // Date Filtering Logic
        $period = $request->input('period', 'month');
        $customStart = $request->input('start_date');
        $customEnd = $request->input('end_date');

        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        switch ($period) {
            case 'today':
                $startDate = now()->startOfDay();
                $endDate = now()->endOfDay();
                break;
            case 'week':
                $startDate = now()->startOfWeek();
                $endDate = now()->endOfWeek();
                break;
            case 'last_15':
                $startDate = now()->subDays(15)->startOfDay();
                $endDate = now()->endOfDay();
                break;
            case 'month':
                $startDate = now()->startOfMonth();
                $endDate = now()->endOfMonth();
                break;
            case 'last_60':
                $startDate = now()->subDays(60)->startOfDay();
                $endDate = now()->endOfDay();
                break;
            case 'last_90':
                $startDate = now()->subDays(90)->startOfDay();
                $endDate = now()->endOfDay();
                break;
            case 'all':
                $startDate = null;
                $endDate = null;
                break;
            case 'custom':
                if ($customStart && $customEnd) {
                    $startDate = \Carbon\Carbon::parse($customStart)->startOfDay();
                    $endDate = \Carbon\Carbon::parse($customEnd)->endOfDay();
                }
                break;
        }

        // Helper to apply date filter
        $applyDateFilter = function ($query) use ($startDate, $endDate) {
            if ($startDate && $endDate) {
                $query->whereBetween('transaction_date', [$startDate, $endDate]);
            }
        };

        // Summary Cards
        $summaryQuery = Transaction::query();
        $applyDateFilter($summaryQuery);
        
        $summary = $summaryQuery->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            ")
            ->first();

        $balance = $summary->total_income - $summary->total_expense;

        // Income by Category
        $incomeQuery = Transaction::query()
            ->where('transactions.type', 'income')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', 'categories.color', DB::raw('SUM(transactions.amount) as total'))
            ->groupBy('categories.name', 'categories.color');
        
        $applyDateFilter($incomeQuery);
        $incomeByCategory = $incomeQuery->get();

        // Expense by Category
        $expenseQuery = Transaction::query()
            ->where('transactions.type', 'expense')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', 'categories.color', DB::raw('SUM(transactions.amount) as total'))
            ->groupBy('categories.name', 'categories.color');
            
        $applyDateFilter($expenseQuery);
        $expenseByCategory = $expenseQuery->get();

        // Custom Widgets Calculation
        $widgets = $user->dashboardWidgets;
        $widgetData = [];

        foreach ($widgets as $widget) {
            $query = Transaction::query();
            
            // Apply Filters
            if (isset($widget->filters['type'])) {
                $query->where('type', $widget->filters['type']);
            }
            
            if (isset($widget->filters['categories']) && is_array($widget->filters['categories'])) {
                $query->whereIn('category_id', $widget->filters['categories']);
            }
            
            // Apply Date Filter to widgets
            $applyDateFilter($query);
            
            $widgetData["widget_{$widget->id}"] = [
                'id' => $widget->id,
                'name' => $widget->name,
                'value' => (float) $query->sum('amount'),
                'type' => $widget->filters['type'] ?? 'neutral',
            ];
        }

        // Default layout if not set
        $defaultLayout = ['balance', 'income', 'expense', 'chart_income', 'chart_expense'];
        $layout = $user->preferences['dashboard_layout'] ?? $defaultLayout;
        
        // Ensure system keys exist (simple migration for dev)
        $systemKeys = ['balance', 'income', 'expense', 'chart_income', 'chart_expense'];
        foreach ($systemKeys as $key) {
            if (!in_array($key, $layout)) {
                $layout[] = $key;
            }
        }
        
        return Inertia::render('Dashboard', [
            'summary' => [
                'income' => (float) $summary->total_income,
                'expense' => (float) $summary->total_expense,
                'balance' => (float) $balance,
            ],
            'charts' => [
                'incomeByCategory' => $incomeByCategory,
                'expenseByCategory' => $expenseByCategory,
            ],
            'widgets' => $widgetData,
            'layout' => $layout,
            'categories' => Category::all(),
        ]);
    }
}
