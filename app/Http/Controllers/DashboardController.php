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
    public function resetLayout()
    {
        $user = Auth::user();
        
        if (!$user->hasFeature('advanced_charts')) {
            return redirect()->back()->with('error', 'Você precisa do plano Premium para personalizar o layout.');
        }

        $preferences = $user->preferences ?? [];
        unset($preferences['dashboard_layout']);
        
        $user->preferences = $preferences;
        $user->save();

        return redirect()->back()->with('success', 'Layout restaurado com sucesso!');
    }

    public function updateCardWidth(Request $request)
    {
        if (!Auth::user()->hasFeature('advanced_charts')) {
            abort(403, 'Funcionalidade restrita ao plano Premium.');
        }

        $request->validate([
            'id' => 'required|string',
            'width' => 'required|in:1/3,1/2,2/3,full'
        ]);

        $user = Auth::user();
        $preferences = $user->preferences ?? [];
        $widths = $preferences['dashboard_card_widths'] ?? [];
        
        $widths[$request->input('id')] = $request->input('width');
        $preferences['dashboard_card_widths'] = $widths;
        
        $user->preferences = $preferences;
        $user->save();

        return redirect()->back();
    }

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
                $firstTransaction = Transaction::orderBy('transaction_date', 'asc')->first();
                $lastTransaction = Transaction::orderBy('transaction_date', 'desc')->first();
                
                if ($firstTransaction) {
                    $startDate = \Carbon\Carbon::parse($firstTransaction->transaction_date)->startOfDay();
                    $endDate = $lastTransaction ? \Carbon\Carbon::parse($lastTransaction->transaction_date)->endOfDay() : now()->endOfDay();
                } else {
                    $startDate = now()->startOfMonth();
                    $endDate = now()->endOfMonth();
                }
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
                $query->whereBetween('transactions.transaction_date', [$startDate, $endDate]);
            }
        };

        // Advanced Stats Logic
        $advancedStats = [];
        $comparisonStats = [];
        // Agora usamos 'advanced_charts' para controlar a visibilidade dos gráficos e layout no Dashboard
        // 'advanced_reports' fica exclusivo para a página de Relatórios
        $hasAdvancedAccess = $user->hasFeature('advanced_charts');

        if ($hasAdvancedAccess) {
            // 1. Top Transactions
            $topTransactionsQuery = Transaction::with('category')->orderByDesc('amount')->take(5);
            $applyDateFilter($topTransactionsQuery);
            $advancedStats['topTransactions'] = $topTransactionsQuery->get();

            // 2. Paid vs Pending
            $statusStatsQuery = Transaction::query()
                 ->select('status', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
                 ->groupBy('status');
            $applyDateFilter($statusStatsQuery);
            $advancedStats['statusStats'] = $statusStatsQuery->get()->keyBy('status');

            // 3. Balance Evolution
            $initialBalance = Transaction::where('transaction_date', '<', $startDate)
                ->selectRaw("SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as total")
                ->value('total') ?? 0;

            $dailyTransactionsQuery = Transaction::query()
                ->select(
                    DB::raw('DATE(transaction_date) as date'),
                    DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as daily_total")
                )
                ->groupBy('date')
                ->orderBy('date');
            $applyDateFilter($dailyTransactionsQuery);
            $dailyTransactions = $dailyTransactionsQuery->get();

            $balanceEvolution = [];
            $currentBalance = $initialBalance;
            
            // Fill gaps using CarbonPeriod
            if ($startDate && $endDate) {
                $periodRange = \Carbon\CarbonPeriod::create($startDate, $endDate);
                foreach ($periodRange as $date) {
                    $dateString = $date->format('Y-m-d');
                    $dayTotal = $dailyTransactions->where('date', $dateString)->first()->daily_total ?? 0;
                    $currentBalance += $dayTotal;
                    $balanceEvolution[] = [
                        'date' => $dateString,
                        'balance' => $currentBalance
                    ];
                }
            }
            $advancedStats['balanceEvolution'] = $balanceEvolution;

            // 4. Income vs Expense by Period
            $diffInDays = $startDate && $endDate ? $startDate->diffInDays($endDate) : 30;
            $groupBy = $diffInDays > 60 ? 'month' : 'day';
            $dateFormat = $groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
            
            $cashFlowQuery = Transaction::query()
                ->select(
                    DB::raw("DATE_FORMAT(transaction_date, '$dateFormat') as label"),
                    DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                    DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
                )
                ->groupBy('label')
                ->orderBy('label');
            $applyDateFilter($cashFlowQuery);
            $advancedStats['cashFlow'] = $cashFlowQuery->get();

            // 5. Next Due (Future Pending)
            $advancedStats['nextDue'] = Transaction::with('category')
                ->where('status', 'pending')
                ->where('transaction_date', '>=', now()->startOfDay())
                ->orderBy('transaction_date')
                ->take(7)
                ->get();

            // 6. Comparison Stats (Previous Period)
            if ($startDate && $endDate) {
                $days = $startDate->diffInDays($endDate) + 1;
                $prevStartDate = $startDate->copy()->subDays($days);
                $prevEndDate = $endDate->copy()->subDays($days);
                
                $prevSummary = Transaction::whereBetween('transaction_date', [$prevStartDate, $prevEndDate])
                    ->selectRaw("
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                    ")
                    ->first();
                    
                $prevBalance = $prevSummary->total_income - $prevSummary->total_expense;
                
                $comparisonStats = [
                    'income' => (float)$prevSummary->total_income,
                    'expense' => (float)$prevSummary->total_expense,
                    'balance' => (float)$prevBalance
                ];
            }
        }

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
                $query->where('transactions.type', $widget->filters['type']);
            }
            
            if (isset($widget->filters['categories']) && is_array($widget->filters['categories'])) {
                $query->whereIn('transactions.category_id', $widget->filters['categories']);
            }
            
            // Apply Date Filter to widgets
            $applyDateFilter($query);
            
            // Calculate breakdown for chart
            $breakdownQuery = clone $query;
            $breakdown = $breakdownQuery->join('categories', 'transactions.category_id', '=', 'categories.id')
                ->select('categories.name', 'categories.color', DB::raw('SUM(transactions.amount) as total'))
                ->groupBy('categories.name', 'categories.color')
                ->get();

            $widgetData["widget_{$widget->id}"] = [
                'id' => $widget->id,
                'name' => $widget->name,
                'value' => (float) $query->sum('amount'),
                'type' => $widget->filters['type'] ?? 'neutral',
                'chart_type' => $widget->filters['chart_type'] ?? 'none',
                'breakdown' => $breakdown
            ];
        }

        // Default layout if not set
        $defaultLayout = ['balance', 'income', 'expense', 'chart_income', 'chart_expense'];
        $layout = $user->preferences['dashboard_layout'] ?? $defaultLayout;
        
        // Ensure system keys exist (simple migration for dev)
        $systemKeys = ['balance', 'income', 'expense', 'chart_income', 'chart_expense'];
        $advancedKeys = ['advanced_balance_evolution', 'advanced_cash_flow', 'advanced_top_transactions', 'advanced_status_stats', 'advanced_next_due'];
        
        // Always include advanced keys in the system keys so they are rendered (locked or unlocked)
        $systemKeys = array_merge($systemKeys, $advancedKeys);
        
        // Auto-add advanced charts to layout if not present
        foreach ($advancedKeys as $key) {
             if (!in_array($key, $layout)) {
                 $layout[] = $key;
             }
        }

        foreach ($systemKeys as $key) {
            if (!in_array($key, $layout) && !str_starts_with($key, 'advanced_')) {
                $layout[] = $key;
            }
        }
        
        return Inertia::render('Dashboard', [
            'summary' => [
                'income' => (float) $summary->total_income,
                'expense' => (float) $summary->total_expense,
                'balance' => (float) $balance,
                'comparison' => $comparisonStats
            ],
            'charts' => [
                'incomeByCategory' => $incomeByCategory,
                'expenseByCategory' => $expenseByCategory,
            ],
            'advancedStats' => $advancedStats,
            'hasAdvancedAccess' => $hasAdvancedAccess,
            'widgets' => $widgetData,
            'layout' => $layout,
            'cardWidths' => $user->preferences['dashboard_card_widths'] ?? [],
            'categories' => Category::all(),
        ]);
    }
}
