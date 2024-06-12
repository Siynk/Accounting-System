<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTransactionReq;
use App\Http\Requests\UpdateTransactionReq;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Activity;
use App\Models\Account;
use App\Models\TemporaryTransactionEdits;
use App\Models\TransactionType;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// Import your models for Category, Activity, and Account

class TransactionController extends Controller
{
    public function addTransaction(AddTransactionReq $request)
    {
        // Retrieve validated data from the request
        $validatedData = $request->validated();

        // Create a new transaction
        $transaction = new Transaction();
        $transaction->clientID = $validatedData['clientID'];
        $transaction->description = $validatedData['description'];
        $transaction->amount = $validatedData['amount'];
        $transaction->cashFlowCategory = $validatedData['cashFlowCategory'];
        $transaction->productLine = $validatedData['productLine'];
        $transaction->save();

        // Save the transaction types
        if (isset($validatedData['transactionTypes'])) {
            foreach ($validatedData['transactionTypes'] as $type) {
                $transactionType = new TransactionType();
                $transactionType->transactionID = $transaction->id;
                $transactionType->description = $type;
                $transactionType->save();
            }
        }

        DB::table('TransactionTransactionType')->insert([
            'transactionID' => $transaction->id,
            'transactionTypeID' => $transactionType->id,
        ]);

        // Optionally, return a response
        return response()->json(['message' => 'Transaction added successfully'], 200);
    }

    public function getAllTransactions()
    {
        try {
            $transactions = Transaction::select(
                'transaction.*',
                'activity.description as activity',
                'category.description as category',
                'accounts.effectivityDate as effectivityDate',
                'users.name as clientName',
                'users.company as company'
            )
                ->leftJoin('activity', 'transaction.id', '=', 'activity.transactionID')
                ->leftJoin('category', 'transaction.id', '=', 'category.transactionID')
                ->leftJoin('accounts', 'transaction.id', '=', 'accounts.transactionID')
                ->leftJoin('users', 'transaction.clientID', '=', 'users.id')
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
        // Count distinct transactions for earnings
        $earningsCount = TransactionType::where(function ($query) {
            $query->where('transactionType.description', 'Asset')
                ->orWhere('transactionType.description', 'Equity')
                ->orWhere('transactionType.description', 'Revenue')
                ->orWhere('transactionType.description', 'Sale');
        })
            ->join('transaction', 'transactionType.transactionID', '=', 'transaction.id')
            ->groupBy('transactionID')
            ->count();

        // Count distinct transactions for expenditures
        $expendituresCount = TransactionType::where(function ($query) {
            $query->where('transactionType.description', 'Liabilities')
                ->orWhere('transactionType.description', 'Expense')
                ->orWhere('transactionType.description', 'Purchase');
        })
            ->join('transaction', 'transactionType.transactionID', '=', 'transaction.id')
            ->groupBy('transactionID')
            ->count();

        // Count cash flow categories directly from transactions
        $operatingCount = Transaction::where('cashFlowCategory', 'operating')->count();
        $investingCount = Transaction::where('cashFlowCategory', 'investing')->count();
        $financingCount = Transaction::where('cashFlowCategory', 'financing')->count();

        // Prepare the counts array
        $counts = [
            'earnings' => $earningsCount,
            'expenditures' => $expendituresCount,
            'operating' => $operatingCount,
            'investing' => $investingCount,
            'financing' => $financingCount,
        ];

        // Return the counts as a JSON response
        return response()->json($counts);
    }

    public function filterTransactions(Request $request)
    {
        $fromDate = $request->input('fromDate');
        $toDate = $request->input('toDate');
        $transactionType = $request->input('transactionType');
        $cashFlowCategory = $request->input('cashFlowCategory');
        $searchText = $request->input('searchText');

        // Start building the query
        $query = Transaction::query();

        // Add joins with related tables
        $query->join('users', 'transaction.clientID', '=', 'users.id');

        $query->select('transaction.*',  'users.company');
        // Add filters based on inputs
        if ($fromDate) {
            $query->where('transaction.transactionDate', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('transaction.transactionDate', '<=', $toDate);
        }

        if ($transactionType) {
            $query->where('transaction.transactionType', $transactionType);
        }
        if ($cashFlowCategory) {
            $query->where('transaction.cashFlowCategory', $cashFlowCategory);
        }

        if ($searchText) {
            $query->where(function ($q) use ($searchText) {
                $q->where('transaction.description', 'like', '%' . $searchText . '%')
                    ->orWhere('transaction.amount', 'like', '%' . $searchText . '%')
                    ->orWhere('users.company', 'like', '%' . $searchText . '%')
                    ->orWhere('transaction.productLine', 'like', '%' . $searchText . '%');
            });
        }

        $query->where('transaction.isDeleted', 0);

        // Execute the query and return results as JSON
        $filteredTransactions = $query->get();

        return response()->json($filteredTransactions);
    }

    public function updateTransaction(UpdateTransactionReq $request)
    {
        // Retrieve validated data from the request 
        $validatedData = $request->validated();

        // Check if status is Pending 
        if ($validatedData['status'] === 'Pending') {
            // Create a new TemporaryTransactionEdits instance 
            $temporaryEdit = new TemporaryTransactionEdits();

            // Assign values to the temporary edit instance 
            $temporaryEdit->client_id = $validatedData['clientID'];
            $temporaryEdit->transaction_id = $validatedData['transactionID'];
            $temporaryEdit->new_description = $validatedData['newDescription'];
            $temporaryEdit->new_amount = $validatedData['newAmount'];
            // Add more fields if necessary 

            // Save the temporary edit to the database 
            $temporaryEdit->save();
        } else {
            // Update the transaction record in the Transaction table 
            Transaction::where('id', $validatedData['transactionID'])
                ->update([
                    'description' => $validatedData['newDescription'], // New description 
                    'amount' => $validatedData['newAmount'], // New amount 
                ]);
        }

        // Optionally, you can return a success response 
        return response()->json(['message' => 'Transaction updated successfully'], 200);
    }

    public function deleteTransaction(Request $request)
    {
        $id = $request->input('id');
        try {
            // Update transaction isDeleted flag
            $transaction = Transaction::findOrFail($id);
            $transaction->isDeleted = 1;
            $transaction->save();

            return response()->json(['message' => 'Transaction deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting the transaction', 'details' => $e->getMessage()], 500);
        }
    }
}
