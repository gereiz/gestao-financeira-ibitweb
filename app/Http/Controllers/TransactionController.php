<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
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

        $query = Transaction::with('category');

        if ($startDate && $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        }

        $transactions = $query->latest('transaction_date')->get();
        $categories = Category::all();
        
        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $categories,
            'filters' => [
                'period' => $period,
                'start_date' => $customStart,
                'end_date' => $customEnd,
            ]
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        return Inertia::render('Transactions/Create', ['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'category_id' => 'required|exists:categories,id',
            'transaction_date' => 'required|date',
            'status' => 'required|in:paid,pending',
        ]);

        // Feature Flag Check: Future Transactions
        $transactionDate = \Carbon\Carbon::parse($validated['transaction_date'])->startOfDay();
        if ($transactionDate->gt(now()->startOfDay()) && !$request->user()->hasFeature('future_transactions')) {
            return back()->withErrors(['transaction_date' => 'Seu plano atual não permite lançamentos futuros. Faça um upgrade para liberar esta funcionalidade.']);
        }

        Transaction::create($validated);

        return redirect()->back();
    }

    public function edit(Transaction $transaction)
    {
        $categories = Category::all();
        return Inertia::render('Transactions/Edit', ['transaction' => $transaction, 'categories' => $categories]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'category_id' => 'required|exists:categories,id',
            'transaction_date' => 'required|date',
            'status' => 'required|in:paid,pending',
        ]);

        // Feature Flag Check: Future Transactions
        $transactionDate = \Carbon\Carbon::parse($validated['transaction_date'])->startOfDay();
        if ($transactionDate->gt(now()->startOfDay()) && !$request->user()->hasFeature('future_transactions')) {
            return back()->withErrors(['transaction_date' => 'Seu plano atual não permite lançamentos futuros. Faça um upgrade para liberar esta funcionalidade.']);
        }

        $transaction->update($validated);

        return redirect()->route('transactions.index');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return redirect()->route('transactions.index');
    }
}
