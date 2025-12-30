<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with('category')->latest('transaction_date')->get();
        $categories = Category::all();
        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $categories
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

        return redirect()->route('transactions.index');
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
