<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTransactionReq;
use App\Http\Requests\UpdateTransactionReq;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Activity;
use App\Models\Account;
use App\Models\ClientTransactionRequest;
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
        $transaction->category = $validatedData['category'];
        $transaction->cashFlow = $validatedData['cashFlow'];
        $transaction->productLine = $validatedData['productLine'];
        $transaction->save();

        // Save the transaction types
        if (isset($validatedData['transactionTypes'])) {
            foreach ($validatedData['transactionTypes'] as $type) {
                DB::table('transactiontransactiontype')->insert([
                    'transactionID' => $transaction->id,
                    'transactionTypeID' => $type,
                ]);
            }
        }

        // Create a new client transaction request
        $clientTransactionRequest = new ClientTransactionRequest();
        $clientTransactionRequest->clientID = $validatedData['clientID'];
        $clientTransactionRequest->transactionID = $transaction->id;
        $clientTransactionRequest->status = $validatedData['status'];
        $clientTransactionRequest->action = 'Create'; // Or whatever action you need
        $clientTransactionRequest->requestDate = now(); // Use current date/time
        $clientTransactionRequest->save();

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

    public function getCounts(Request $request)
    {
        $company = $request->input('company', '');

        // Count distinct transactions for earnings with approved status
        $earningsCount = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('users', 'transaction.clientID', '=', 'users.id') // Join with users table
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->whereIn('transactiontype.description', ['Revenue', 'Sale'])
            ->where('users.company', 'like', '%' . $company . '%') // Filter by company
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->distinct('transaction.id')
            ->count();

        // Count distinct transactions for expenditures with approved status
        $expendituresCount = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('users', 'transaction.clientID', '=', 'users.id') // Join with users table
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->whereIn('transactiontype.description', ['Liabilities', 'Expense', 'Purchase', 'Loan'])
            ->where('users.company', 'like', '%' . $company . '%') // Filter by company
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->distinct('transaction.id')
            ->count();

        // Count cash flow categories directly from transactions with approved status
        $operatingCount = Transaction::join('users', 'transaction.clientID', '=', 'users.id') // Join with users table
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('category', 'Operating')
            ->where('users.company', 'like', '%' . $company . '%') // Filter by company
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->count();

        $investingCount = Transaction::join('users', 'transaction.clientID', '=', 'users.id') // Join with users table
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('category', 'investing')
            ->where('users.company', 'like', '%' . $company . '%') // Filter by company
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->count();

        $financingCount = Transaction::join('users', 'transaction.clientID', '=', 'users.id') // Join with users table
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('category', 'Financing')
            ->where('users.company', 'like', '%' . $company . '%') // Filter by company
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->count();

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
        $category = $request->input('category');
        $searchText = $request->input('searchText');
        $company = $request->input('company');

        // Start building the query 
        $query = Transaction::query();

        // Add joins with related tables 
        $query->join('users', 'transaction.clientID', '=', 'users.id')
            ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID'); // Join with clientTransactionRequest

        $query->select('transaction.*', 'users.company', 'transactiontype.description as transactionType');

        // Add filters based on inputs 
        if ($fromDate) {
            $query->where('transaction.transactionDate', '>=', $fromDate . ' 00:00:00');
        }
        
        if ($toDate) {
            $query->where('transaction.transactionDate', '<=', $toDate . ' 23:59:59');
        }
        

        if ($transactionType) {
            $query->where('transactiontype.description', $transactionType);
        }

        if ($category) {
            $query->where('transaction.category', $category);
        }

        if ($searchText) {
            $query->where(function ($q) use ($searchText) {
                $q->where('transaction.description', 'like', '%' . $searchText . '%')
                    ->orWhere('transaction.amount', 'like', '%' . $searchText . '%')
                    ->orWhere('users.company', 'like', '%' . $searchText . '%')
                    ->orWhere('transaction.productLine', 'like', '%' . $searchText . '%')
                    ->orWhere('transactiontype.description', 'like', '%' . $searchText . '%');
            });
        }

        if ($company) {
            $query->where('users.company', $company);
        }

        // Filter for approved transactions
        $query->where('clienttransctionrequest.status', 'Approved'); // Filter by approved status

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
            $temporaryEdit->clientID = $validatedData['clientID'];
            $temporaryEdit->transactionID = $validatedData['transactionID'];
            $temporaryEdit->newDescription = $validatedData['newDescription'];
            $temporaryEdit->newAmount = $validatedData['newAmount'];
            $temporaryEdit->status = $validatedData['status'];
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

    public function generateTrendAnalysisReport(Request $request)
    {
        $companyName = $request->input('companyName');

        // Define the query to fetch data 
        $reportData = DB::table('transaction')
            ->select(
                DB::raw('YEAR(transaction.transactionDate) as year'),
                DB::raw('MONTH(transaction.transactionDate) as month'),
                DB::raw('SUM(CASE WHEN transactiontype.description IN ("Revenue", "Sale") 
                          AND NOT EXISTS (
                              SELECT 1 FROM transactiontransactiontype ttt 
                              JOIN transactiontype tt ON ttt.transactionTypeID = tt.id
                              WHERE ttt.transactionID = transaction.id 
                              AND tt.description IN ("Liabilities", "Asset", "Equity")
                          ) 
                          THEN transaction.amount ELSE 0 END) as totalRevenue'),
                DB::raw('SUM(CASE WHEN transactiontype.description IN ("Expense", "Purchase", "Loan") 
                          AND NOT EXISTS (
                              SELECT 1 FROM transactiontransactiontype ttt 
                              JOIN transactiontype tt ON ttt.transactionTypeID = tt.id
                              WHERE ttt.transactionID = transaction.id 
                              AND tt.description IN ("Liabilities", "Asset", "Equity")
                          ) 
                          THEN transaction.amount ELSE 0 END) as totalExpense')
            )
            ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('users.userType', 'client')
            ->where('transaction.isDeleted', 0)
            ->where('users.company', 'LIKE', "%$companyName%") // Filter by company name 
            ->groupBy(DB::raw('YEAR(transaction.transactionDate)'), DB::raw('MONTH(transaction.transactionDate)'))
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        // Array to convert month number to month name
        $months = [
            1 => 'January',
            2 => 'February',
            3 => 'March',
            4 => 'April',
            5 => 'May',
            6 => 'June',
            7 => 'July',
            8 => 'August',
            9 => 'September',
            10 => 'October',
            11 => 'November',
            12 => 'December'
        ];

        // Process the report data as needed 
        $processedReportData = [];

        foreach ($reportData as $data) {
            $profit = $data->totalRevenue - $data->totalExpense;
            $processedReportData[] = [
                'year' => $data->year,
                'month' => $months[$data->month],
                'totalRevenue' => $data->totalRevenue,
                'totalExpense' => $data->totalExpense,
                'profit' => $profit,
            ];
        }

        // Return or further process $processedReportData as needed 
        return response()->json($processedReportData);
    }

    public function generateBalanceSheet(Request $request)
    {
        // Get the filter inputs
        $companyName = $request->input('companyName');
        $fromDate = $request->input('dateFrom');
        $toDate = $request->input('dateTo');
    
        // Adjust to include entire day if fromDate and toDate are the same
        // Ensure fromDate and toDate are formatted with time
        $fromDate = date('Y-m-d H:i:s', strtotime($fromDate . ' 00:00:00'));
        $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' 23:59:59'));
    
        // Define asset and liability transaction types
        $assetTypes = ['Asset'];
        $liabilityTypes = ['Liabilities'];
        $equityTypes = ['Equity'];
    
        // Query for assets
        $assets = DB::table('transaction')
            ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->whereIn('transactiontype.description', $assetTypes)
            ->where('clienttransctionrequest.status', 'Approved')
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->select('transaction.description', 'transaction.amount')
            ->get();
    
        // Query for liabilities
        $liabilities = DB::table('transaction')
            ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->whereIn('transactiontype.description', $liabilityTypes)
            ->where('clienttransctionrequest.status', 'Approved')
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->select('transaction.description', 'transaction.amount')
            ->get();
    
        // Query for owner's equity
        $equities = DB::table('transaction')
            ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->whereIn('transactiontype.description', $equityTypes)
            ->where('clienttransctionrequest.status', 'Approved')
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->select('transaction.description', 'transaction.amount')
            ->get();
    
        // Calculate totals
        $totalAssets = $assets->sum('amount');
        $totalLiabilities = $liabilities->sum('amount');
        $ownerEquity = $totalAssets - $totalLiabilities;
        $totalLiabilitiesPlusTotalEquity = $ownerEquity + $totalLiabilities;
    
        // Prepare the data to return
        $balanceSheetData = [
            'assets' => $assets,
            'liabilities' => $liabilities,
            'totalAssets' => $totalAssets,
            'totalLiabilities' => $totalLiabilities,
            'ownerEquity' => $ownerEquity,
            'totalLiabilitiesPlusTotalEquity' => $totalLiabilitiesPlusTotalEquity
        ];
    
        return response()->json($balanceSheetData);
    }
    


    public function generateIncomeStatement(Request $request)
    {
        try {
            $companyName = $request->input('companyName');
            $fromDate = $request->input('dateFrom');
            $toDate = $request->input('dateTo');

            // Adjust to include entire day if fromDate and toDate are the same
            if ($fromDate === $toDate) {
                $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' +1 day -1 second'));
            }

            // Retrieve the list of revenues
            $revenues = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('users', 'transaction.clientID', '=', 'users.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Revenue', 'Sale'])
                ->where('users.company', 'LIKE', "%$companyName%")
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select('transaction.description', 'transaction.amount')
                ->get();

            // Calculate total revenue
            $totalRevenue = $revenues->sum('amount');

            // Retrieve lists and totals for each type of expense
            $operatingExpenses = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('users', 'transaction.clientID', '=', 'users.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Expense'])
                ->where('transaction.category', 'Operating')
                ->where('users.company', 'LIKE', "%$companyName%")
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select('transaction.description', 'transaction.amount')
                ->get();
            $totalOperatingExpenses = $operatingExpenses->sum('amount');

            $financingExpenses = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('users', 'transaction.clientID', '=', 'users.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Expense'])
                ->where('transaction.category', 'Financing')
                ->where('users.company', 'LIKE', "%$companyName%")
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select('transaction.description', 'transaction.amount')
                ->get();
            $totalFinancingExpenses = $financingExpenses->sum('amount');

            $investingExpenses = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('users', 'transaction.clientID', '=', 'users.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Expense'])
                ->where('transaction.category', 'Investing')
                ->where('users.company', 'LIKE', "%$companyName%")
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select('transaction.description', 'transaction.amount')
                ->get();
            $totalInvestingExpenses = $investingExpenses->sum('amount');

            // Calculate net income
            $netIncome = $totalRevenue - ($totalOperatingExpenses + $totalFinancingExpenses + $totalInvestingExpenses);

            // Prepare the summary data
            $summaryData = [
                'revenues' => $revenues,
                'totalRevenue' => $totalRevenue,
                'operatingExpenses' => $operatingExpenses,
                'totalOperatingExpenses' => $totalOperatingExpenses,
                'financingExpenses' => $financingExpenses,
                'totalFinancingExpenses' => $totalFinancingExpenses,
                'investingExpenses' => $investingExpenses,
                'totalInvestingExpenses' => $totalInvestingExpenses,
                'netIncome' => $netIncome,
            ];

            // Return the financial summary as JSON
            return response()->json($summaryData);
        } catch (Exception $e) {
            // Log the exception message
            Log::error($e->getMessage());

            // Return a JSON response with the error message and a 500 status code
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function getCashflowData(Request $request)
    {
        $companyName = $request->input('companyName');
        $fromDate = $request->input('dateFrom');
        $toDate = $request->input('dateTo');

        // Adjust to include entire day if fromDate and toDate are the same
        // Ensure fromDate and toDate are formatted with time
        $fromDate = date('Y-m-d H:i:s', strtotime($fromDate . ' 00:00:00'));
        $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' 23:59:59'));

        // Fetch operating activities
        $operatingActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Operating')
            ->select('transaction.*')
            ->get();

        // Calculate operating income activities
        $operatingIncomeActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Operating')
            ->where('transaction.cashFlow', 'Inflow')
            ->select('transaction.*')
            ->get();
        $operatingIncome = $operatingIncomeActivities->sum('amount');

        // Calculate operating expenses activities
        $operatingExpenseActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Operating')
            ->where('transaction.cashFlow', 'Outflow')
            ->select('transaction.*')
            ->get();
        $operatingExpenses = $operatingExpenseActivities->sum('amount');

        $operatingNetCashflow = $operatingIncome - $operatingExpenses;

        // Fetch investing activities
        $investingActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Investing')
            ->select('transaction.*')
            ->get();

        // Calculate investing income activities
        $investingIncomeActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Investing')
            ->where('transaction.cashFlow', 'Inflow')
            ->select('transaction.*')
            ->get();
        $investingIncome = $investingIncomeActivities->sum('amount');

        // Calculate investing expenses activities
        $investingExpenseActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Investing')
            ->where('transaction.cashFlow', 'Outflow')
            ->select('transaction.*')
            ->get();
        $investingExpenses = $investingExpenseActivities->sum('amount');

        $investingNetCashflow = $investingIncome - $investingExpenses;

        // Fetch financing activities
        $financingActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Financing')
            ->select('transaction.*')
            ->get();

        // Calculate financing income activities
        $financingIncomeActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Financing')
            ->where('transaction.cashFlow', 'Inflow')
            ->select('transaction.*')
            ->get();
        $financingIncome = $financingIncomeActivities->sum('amount');

        // Calculate financing expenses activities
        $financingExpenseActivities = Transaction::join('users', 'transaction.clientID', '=', 'users.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('users.company', 'LIKE', "%$companyName%")
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Financing')
            ->where('transaction.cashFlow', 'Outflow')
            ->select('transaction.*')
            ->get();
        $financingExpenses = $financingExpenseActivities->sum('amount');

        $financingNetCashflow = $financingIncome - $financingExpenses;

        // Calculate total net cash flow
        $totalNetCashflow = $operatingNetCashflow + $investingNetCashflow + $financingNetCashflow;

        // Prepare the response data
        $responseData = [
            'operatingActivities' => $operatingActivities,
            'operatingIncomeActivities' => $operatingIncomeActivities,
            'operatingIncome' => $operatingIncome,
            'operatingExpenseActivities' => $operatingExpenseActivities,
            'operatingExpenses' => $operatingExpenses,
            'operatingNetCashflow' => $operatingNetCashflow,
            'investingActivities' => $investingActivities,
            'investingIncomeActivities' => $investingIncomeActivities,
            'investingIncome' => $investingIncome,
            'investingExpenseActivities' => $investingExpenseActivities,
            'investingExpenses' => $investingExpenses,
            'investingNetCashflow' => $investingNetCashflow,
            'financingActivities' => $financingActivities,
            'financingIncomeActivities' => $financingIncomeActivities,
            'financingIncome' => $financingIncome,
            'financingExpenseActivities' => $financingExpenseActivities,
            'financingExpenses' => $financingExpenses,
            'financingNetCashflow' => $financingNetCashflow,
            'totalNetCashflow' => $totalNetCashflow,
        ];

        // Return the response as JSON
        return response()->json($responseData);
    }


    public function getSegmentReportData(Request $request)
    {
        try {
            // Retrieve filter inputs
            $companyName = $request->input('companyName');
            $fromDate = $request->input('dateFrom');
            $toDate = $request->input('dateTo');

            // Adjust to include entire day if fromDate and toDate are the same
            if ($fromDate === $toDate) {
                $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' +1 day -1 second'));
            }

            // Query for total revenue and expenses per product line
            $segmentReportData = DB::table('transaction')
                ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('users', 'transaction.clientID', '=', 'users.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->where('users.company', 'LIKE', "%$companyName%")
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select(
                    'transaction.productLine',
                    DB::raw('SUM(CASE WHEN transactiontype.description IN ("Revenue", "Sale") 
                          AND NOT EXISTS (
                              SELECT 1 FROM transactiontransactiontype ttt 
                              JOIN transactiontype tt ON ttt.transactionTypeID = tt.id
                              WHERE ttt.transactionID = transaction.id 
                              AND tt.description IN ("Liabilities", "Asset", "Equity")
                          ) 
                          THEN transaction.amount ELSE 0 END) as totalRevenue'),
                    DB::raw('SUM(CASE WHEN transactiontype.description IN ("Expense", "Purchase", "Loan") 
                          AND NOT EXISTS (
                              SELECT 1 FROM transactiontransactiontype ttt 
                              JOIN transactiontype tt ON ttt.transactionTypeID = tt.id
                              WHERE ttt.transactionID = transaction.id 
                              AND tt.description IN ("Liabilities", "Asset", "Equity")
                          ) 
                          THEN transaction.amount ELSE 0 END) as totalExpenses')
                )
                ->groupBy('transaction.productLine')
                ->get();

            // Calculate net income for each product line
            foreach ($segmentReportData as $data) {
                $data->netIncome = $data->totalRevenue - $data->totalExpenses;
            }

            // Return the segment report data as JSON
            return response()->json($segmentReportData);
        } catch (Exception $e) {
            // Log the exception message
            Log::error($e->getMessage());

            // Return a JSON response with the error message and a 500 status code
            return response()->json(['error' => 'An error occurred while retrieving segment report data.'], 500);
        }
    }


    public function getClientPendingTransactionRequests()
    {
        $pendingRequests = ClientTransactionRequest::select('clienttransctionrequest.*', 'users.name as client_name', 'transaction.amount as transaction_amount')
            ->join('users', 'clienttransctionrequest.clientID', '=', 'users.id')
            ->join('transaction', 'clienttransctionrequest.transactionID', '=', 'transaction.id')
            ->where('clienttransctionrequest.status', 'Pending')
            ->get();

        return response()->json($pendingRequests);
    }

    public function getPendingTemporaryTransactionEdits()
    {
        $pendingEdits = TemporaryTransactionEdits::select('temporarytransactionedits.*', 'transaction.amount as transaction_amount', 'users.name as client_name')
            ->join('transaction', 'temporarytransactionedits.transactionID', '=', 'transaction.id') // Using 'transaction' as specified
            ->join('users', 'temporarytransactionedits.clientID', '=', 'users.id')
            ->where('temporarytransactionedits.status', 'Pending')
            ->get();

        return response()->json($pendingEdits);
    }



    public function respondToPendingTransactionRequest(Request $request)
    {
        $validatedData = $request->validate([
            'requestID' => 'required|exists:clienttransctionrequest,id',
            'status' => 'required|in:Approved,Declined',
        ]);

        $transactionRequest = ClientTransactionRequest::find($validatedData['requestID']);
        if (!$transactionRequest) {
            return response()->json(['message' => 'Transaction request not found.'], 404);
        }

        $transactionRequest->status = $validatedData['status'];
        $transactionRequest->save();

        return response()->json(['message' => 'Transaction request processed successfully.']);
    }

    public function respondToPendingTransactionEdit(Request $request)
    {
        $validatedData = $request->validate([
            'editID' => 'required|exists:temporarytransactionedits,id',
            'status' => 'required|in:Approved,Declined',
        ]);

        $temporaryEdit = TemporaryTransactionEdits::find($validatedData['editID']);
        if (!$temporaryEdit) {
            return response()->json(['message' => 'Temporary transaction edit not found.'], 404);
        }

        // Handle the approved status
        if ($validatedData['status'] === 'Approved') {
            // Assuming there's a Transaction model to apply changes to
            $transaction = Transaction::find($temporaryEdit->transactionID);
            if ($transaction) {
                $transaction->description = $temporaryEdit->newDescription;
                $transaction->amount = $temporaryEdit->newAmount;
                $transaction->save();
            }
        }

        // Update the status of the temporary edit
        $temporaryEdit->status = $validatedData['status'];
        $temporaryEdit->save();

        return response()->json(['message' => 'Temporary transaction edit processed successfully.']);
    }
}
