<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTransactionReq;
use App\Http\Requests\UpdateTransactionReq;
use App\Models\Transaction;
use App\Models\Category;
use App\Models\Activity;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Account;
use App\Models\ClientTransactionRequest;
use App\Models\TemporaryTransactionEdits;
use App\Models\TransactionType;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Twilio\Rest\Client;
use App\Models\User;

// Import your models for Category, Activity, and Account

class TransactionController extends Controller
{
    public function addTransaction(AddTransactionReq $request)
    {
        // Retrieve validated data from the request
        $validatedData = $request->validated();

        // Create a new transaction
        $transaction = new Transaction();
        if(isset($validatedData['clientID']) && isset($validatedData['projectID'])){
          $transaction->clientID = $validatedData['clientID'];
          $transaction->projectID = $validatedData['projectID'];
        }
        if(isset($validatedData['fee'])){
          $transaction->fee = $validatedData['fee'];
        }
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
        if(isset($validatedData['clientID']) && isset($validatedData['projectID'])){
          $clientTransactionRequest->clientID = $validatedData['clientID'];
          $clientTransactionRequest->projectID = $validatedData['projectID'];
        }
        if(isset($validatedData['fee'])){
          $transaction->fee = $validatedData['fee'];
        }
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
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->whereIn('transactiontype.description', ['Revenue', 'Sale', "Payment"])
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->distinct('transaction.id')
            ->count();

        // Count distinct transactions for expenditures with approved status
        $expendituresCount = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->whereIn('transactiontype.description', ['Liabilities', 'Expense', 'Purchase', 'Loan'])
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->distinct('transaction.id')
            ->count();

        // Count cash flow categories directly from transactions with approved status
        $operatingCount = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('category', 'Operating')
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->count();

        $investingCount = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('category', 'investing')
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->count();

        $financingCount = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('category', 'Financing')
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->count();

            $projectCounts = Project::join('transaction', 'project.id', '=', 'transaction.projectID')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->leftJoin('users', 'transaction.clientID', '=', 'users.id') // Join with users table
            ->where('clienttransctionrequest.status', 'Approved') // Filter by approved status
            ->where('transaction.isDeleted', 0) // Ensure that deleted transactions are excluded
            ->where('users.company', 'like', '%' . $company . '%') // Filter by company
            ->groupBy('project.id', 'project.projectName') // Group by project and project name
            ->select('project.projectName', DB::raw('count(transaction.id) as transactionCount'))
            ->get();
        

        // Prepare the counts array 
        $counts = [
            'earnings' => $earningsCount,
            'expenditures' => $expendituresCount,
            'operating' => $operatingCount,
            'investing' => $investingCount,
            'financing' => $financingCount,
            'projects' => $projectCounts, // Add project counts here
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
        $projectName = $request->input('projectName'); // Adding filter for project name (optional)

        // Start building the query
        $query = Transaction::query();

        // Add left joins with related tables to allow nullable clientID and projectID
        $query->leftJoin('users', 'transaction.clientID', '=', 'users.id')
            ->leftJoin('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->leftJoin('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->leftJoin('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->leftJoin('project', 'transaction.projectID', '=', 'project.id'); // Left join with the project table

        $query->select('transaction.*', 'users.company', 'transactiontype.description as transactionType', 'project.projectName'); // Selecting project fields

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
                    ->orWhere('transactiontype.description', 'like', '%' . $searchText . '%')
                    ->orWhere('project.projectName', 'like', '%' . $searchText . '%'); // Add project name search
            });
        }

        if ($company) {
            $query->where('users.company', $company);
        }

        // Filter for approved transactions
        $query->where('clienttransctionrequest.status', 'Approved'); // Filter by approved status

        $query->where('transaction.isDeleted', 0);

        // If you want to filter based on project name or status (optional)
        if ($projectName) {
            $query->where('project.projectName', 'like', '%' . $projectName . '%');
        }

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
                DB::raw('SUM(CASE WHEN transactiontype.description IN ("Revenue", "Sale", "Payment") 
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
            ->leftJoin('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->leftJoin('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->leftJoin('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.isDeleted', 0)
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
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->whereIn('transactiontype.description', $assetTypes)
            ->where('clienttransctionrequest.status', 'Approved')
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->select('transaction.description', 'transaction.amount')
            ->get();
    
        // Query for liabilities
        $liabilities = DB::table('transaction')
            ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->whereIn('transactiontype.description', $liabilityTypes)
            ->where('clienttransctionrequest.status', 'Approved')
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->select('transaction.description', 'transaction.amount')
            ->get();
    
        // Query for owner's equity
        $equities = DB::table('transaction')
            ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->whereIn('transactiontype.description', $equityTypes)
            ->where('clienttransctionrequest.status', 'Approved')
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
            $fromDate = $request->input('dateFrom');
            $toDate = $request->input('dateTo');

            // Adjust to include entire day if fromDate and toDate are the same
            $fromDate = date('Y-m-d H:i:s', strtotime($fromDate . ' 00:00:00'));
            $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' 23:59:59'));

            // Retrieve the list of revenues
            $revenues = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Revenue', 'Sale', 'Payment'])
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select('transaction.description', 'transaction.amount')
                ->get();

            // Calculate total revenue
            $totalRevenue = $revenues->sum('amount');

            // Retrieve lists and totals for each type of expense
            $operatingExpenses = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Expense', 'Purchase'])
                ->where('transaction.category', 'Operating')
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select('transaction.description', 'transaction.amount')
                ->get();
            $totalOperatingExpenses = $operatingExpenses->sum('amount');

            $financingExpenses = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Expense', 'Purchase'])
                ->where('transaction.category', 'Financing')
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select('transaction.description', 'transaction.amount')
                ->get();
            $totalFinancingExpenses = $financingExpenses->sum('amount');

            $investingExpenses = Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
                ->whereIn('transactiontype.description', ['Expense', 'Purchase'])
                ->where('transaction.category', 'Investing')
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
        $fromDate = $request->input('dateFrom');
        $toDate = $request->input('dateTo');

        // Adjust to include entire day if fromDate and toDate are the same
        // Ensure fromDate and toDate are formatted with time
        $fromDate = date('Y-m-d H:i:s', strtotime($fromDate . ' 00:00:00'));
        $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' 23:59:59'));

        // Fetch operating activities
        $operatingActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Operating')
            ->select('transaction.*')
            ->get();

        // Calculate operating income activities
        $operatingIncomeActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Operating')
            ->where('transaction.cashFlow', 'Inflow')
            ->select('transaction.*')
            ->get();
        $operatingIncome = $operatingIncomeActivities->sum('amount');

        // Calculate operating expenses activities
        $operatingExpenseActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
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
        $investingActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Investing')
            ->select('transaction.*')
            ->get();

        // Calculate investing income activities
        $investingIncomeActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') 
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Investing')
            ->where('transaction.cashFlow', 'Inflow')
            ->select('transaction.*')
            ->get();
        $investingIncome = $investingIncomeActivities->sum('amount');

        // Calculate investing expenses activities
        $investingExpenseActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') 
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
        $financingActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') 
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Financing')
            ->select('transaction.*')
            ->get();

        // Calculate financing income activities
        $financingIncomeActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
            ->where('transaction.category', 'Financing')
            ->where('transaction.cashFlow', 'Inflow')
            ->select('transaction.*')
            ->get();
        $financingIncome = $financingIncomeActivities->sum('amount');

        // Calculate financing expenses activities
        $financingExpenseActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
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
            $fromDate = $request->input('dateFrom');
            $toDate = $request->input('dateTo');

            // Adjust to include entire day if fromDate and toDate are the same
            $fromDate = date('Y-m-d H:i:s', strtotime($fromDate . ' 00:00:00'));
            $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' 23:59:59'));

            // Query for total revenue and expenses per product line
            $segmentReportData = DB::table('transaction')
                ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
                ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
                ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
                ->where('transaction.isDeleted', 0)
                ->where('clienttransctionrequest.status', 'Approved') 
                ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
                ->select(
                    'transaction.productLine',
                    DB::raw('SUM(CASE WHEN transactiontype.description IN ("Revenue", "Sale", "Payment") 
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

    public function getAllPayments()
    {
        // Fetch all payments with their related information (client, project, transaction)
        // And join with the paymentDeclineReason table to get the decline reason
        $payments = Payment::select('payment.*', 'paymentDeclineReason.reason as declineReason')
            ->leftJoin('paymentDeclineReason', 'payment.id', '=', 'paymentDeclineReason.paymentID')
            ->with(['client', 'project', 'transaction'])
            ->get();

        return response()->json($payments);
    }


    public function updatePaymentStatus(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'clientID' => 'required|exists:users,id',
            'status' => 'required|in:Approved,Declined',  // Only Approved or Declined are allowed
            'decline_reason' => 'required_if:status,Declined|string|max:255',  // Reason is required if status is Declined
            'paymentID' => 'required',
        ]);

        // Find the payment record by transactionID
        $payment = Payment::where('id', $validated['paymentID'])->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        // If the status is 'Declined', insert the decline reason
        if ($validated['status'] === 'Declined') {
          $user = User::find($validated['clientID']);
          Mail::send('emails.decline-payment', ['user' => $user], function ($message) use ($user) {
              $message->to($user->email);
              $message->subject('Your Payment Request Has Been Declined');
          });

          // Send SMS notification using Twilio (SMS for approved status)
          $this->sendSms($user->contact, 'Your Payment Request has been declined.');
            // Insert the reason into the paymentDeclineReason table
            $declineReason = $validated['decline_reason'];

            // Create the decline reason record
            \DB::table('paymentDeclineReason')->insert([
                'paymentID' => $payment->id,
                'reason' => $declineReason,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        if($validated['status'] === 'Approved'){
          $user = User::find($validated['clientID']);
          Mail::send('emails.approve-payment', ['user' => $user], function ($message) use ($user) {
              $message->to($user->email);
              $message->subject('Your Payment Request Has Been Approved');
          });

          // Send SMS notification using Twilio (SMS for approved status)
          $this->sendSms($user->contact, 'Congratulations! Your Payment Request has been approved.');
        }
        // Update the payment status
        $payment->status = $validated['status'];
        $payment->save();

        return response()->json([
            'message' => 'Payment status updated successfully',
            'payment' => $payment
        ]);
    }


    public function createPayment(Request $request)
    {
        // Validate the required fields
        $validated = $request->validate([
            'clientID' => 'required|exists:users,id', // Ensure client exists in users table
            'projectID' => 'required|exists:project,id', // Ensure project exists in project table
            'transactionID' => 'required|exists:transaction,id', // Ensure transaction exists in transaction table
            'amount' => 'required|numeric', // Ensure valid amount
        ]);

        // Create a new payment record
        $payment = Payment::create([
            'clientID' => $validated['clientID'],
            'projectID' => $validated['projectID'],
            'transactionID' => $validated['transactionID'],
            'amount' => $validated['amount'],
            'status' => 'Pending', // Default value for status is 'Pending'
        ]);

        return response()->json(['message' => 'Payment created successfully', 'payment' => $payment]);
    }
    private function sendSms($contact, $message)
    {
        // Your Twilio credentials (stored in .env)
        $sid = env('TWILIO_SID');
        $authToken = env('TWILIO_AUTH_TOKEN');
        $twilioPhoneNumber = env('TWILIO_PHONE_NUMBER');

        // Initialize Twilio client
        $client = new Client($sid, $authToken);

        // Send SMS
        try {
            $client->messages->create(
                $contact, // User's contact number
                [
                    'from' => $twilioPhoneNumber, // Twilio phone number
                    'body' => $message // The message content
                ]
            );
        } catch (\Exception $e) {
            // Handle any error that occurs during SMS sending
            return response()->json(['error' => 'Failed to send SMS: ' . $e->getMessage()], 500);
        }
    }
}
