<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTransactionReq;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Activity;
use App\Models\Account;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// Import your models for Category, Activity, and Account

class TransactionController extends Controller
{
    public function addTransaction(AddTransactionReq $request)
    {
        // Begin a transaction to ensure database consistency
        DB::beginTransaction();
        try {
            // Create the transaction
            $transaction = Transaction::create($request->validated());

            // If 'accounts' is not 'None', create or update the account
            if ($request->accounts !== 'None') {
                // Assuming you have a method in your Account model to handle this
                Account::create([
                    'payable' => $request->accounts === 'payable' ? 1 : 0,
                    'receivable' => $request->accounts === 'receivable' ? 1 : 0,
                    'transactionID' => $transaction->id,
                    'effectivityDate' => $request->effectivityDate
                ]);
            }

            // Create category entry with the transaction ID
            Category::create([
                'description' => $request->category,
                'transactionID' => $transaction->id
            ]);

            // Create activity entry with the transaction ID
            Activity::create([
                'description' => $request->activity,
                'transactionID' => $transaction->id
            ]);

            // Commit the transaction
            DB::commit();

            return response()->json(['message' => 'Transaction added successfully'], 200);
        } catch (\Exception $e) {
            // Rollback the transaction in case of error
            DB::rollback();
            return response()->json(['message' => 'Failed to add transaction', 'error' => $e->getMessage()], 500);
        }
    }

    public function getAllTransactions()
    {
        try {
            $transactions = Transaction::select('transaction.*', 'activity.description as activity', 'category.description as category', 'accounts.effectivityDate as effectivityDate')
                ->leftJoin('activity', 'transaction.id', '=', 'activity.transactionID')
                ->leftJoin('category', 'transaction.id', '=', 'category.transactionID')
                ->leftJoin('accounts', 'transaction.id', '=', 'accounts.transactionID')
                ->selectRaw("CASE WHEN accounts.payable = 1 AND accounts.receivable = 0 THEN 'Payable' WHEN accounts.payable = 0 AND accounts.receivable = 1 THEN 'Receivable' END as accounts")
                ->orderByDesc('transaction.id') // Sorting by transactionID in descending order
                ->get();

            return response()->json($transactions);
        } catch (Exception $e) {
            // Log the exception message
            Log::error($e->getMessage());

            // Return a JSON response with the error message and a 500 status code
            return response()->json(['error' => 'An error occurred while retrieving transactions.'], 500);
        }
    }


    public function getCounts()
    {
        $counts = [
            'paymentMethods' => [
                'cash' => Transaction::where('paymentMethod', 'Cash')->count(),
                'check' => Transaction::where('paymentMethod', 'Check')->count(),
                'creditCard' => Transaction::where('paymentMethod', 'Credit Card')->count(),
                'debitCard' => Transaction::where('paymentMethod', 'Debit Card')->count(),
                'online' => Transaction::where('paymentMethod', 'Online')->count(),
            ],
            'transactionTypes' => [
                'cashIn' => Transaction::where('transactionType', 'Cash In')->count(),
                'cashOut' => Transaction::where('transactionType', 'Cash Out')->count(),
            ],
            'earningsCount' => Transaction::join('category', 'transaction.id', '=', 'category.transactionID')
                ->where('category.description', 'Earnings')->count(),
            'expendituresCount' => Transaction::join('category', 'transaction.id', '=', 'category.transactionID')
                ->where('category.description', 'Expenditures')->count(),
            'payableCount' => Transaction::join('accounts', 'transaction.id', '=', 'accounts.transactionID')
                ->where('accounts.payable', 1)
                ->where('accounts.receivable', 0)
                ->count(),
            'receivableCount' => Transaction::join('accounts', 'transaction.id', '=', 'accounts.transactionID')
                ->where('accounts.payable', 0)
                ->where('accounts.receivable', 1)
                ->count(),
            'operatingCount' => Transaction::join('activity', 'transaction.id', '=', 'activity.transactionID')
                ->where('activity.description', 'Operating')->count(),
            'investingCount' => Transaction::join('activity', 'transaction.id', '=', 'activity.transactionID')
                ->where('activity.description', 'Investing')->count(),
            'financingCount' => Transaction::join('activity', 'transaction.id', '=', 'activity.transactionID')
                ->where('activity.description', 'Financing')->count(),
        ];

        return response()->json($counts);
    }
}
