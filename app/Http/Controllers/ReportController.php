<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $hasAccess = $user->hasFeature('advanced_reports');

        if (!$hasAccess) {
            return Inertia::render('Reports/Index', [
                'hasAccess' => false,
                'data' => [],
            ]);
        }

        // Logic for Advanced Reports
        // Example: Monthly Income vs Expense Evolution (Last 12 months)
        $evolution = Transaction::select(
            DB::raw("DATE_FORMAT(transaction_date, '%Y-%m') as month"),
            DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
            DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
        )
        ->where('user_id', $user->id)
        ->where('transaction_date', '>=', now()->subMonths(12)->startOfMonth())
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Example: Expenses by Category (Top 5)
        $topExpenses = Transaction::where('transactions.user_id', $user->id)
            ->where('transactions.type', 'expense')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('SUM(transactions.amount) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        return Inertia::render('Reports/Index', [
            'hasAccess' => true,
            'data' => [
                'evolution' => $evolution,
                'topExpenses' => $topExpenses,
            ]
        ]);
    }
}
