<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTransactionReq;
use App\Http\Requests\UpdateTransactionReq;
use App\Models\Transaction;
use App\Models\Materials;
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

      // Assign the necessary attributes to the transaction
      if (isset($validatedData['clientID']) && isset($validatedData['projectID'])) {
          $transaction->clientID = $validatedData['clientID'];
          $transaction->projectID = $validatedData['projectID'];
      }

      if (isset($validatedData['transactionStatus'])) {
        $transaction->status = $validatedData['transactionStatus'];
      }
      if (isset($validatedData['fee'])) {
        $transaction->fee = $validatedData['fee'];
      }
      
      $transaction->description = $validatedData['description'];
      $transaction->amount = $validatedData['amount'];
      $transaction->category = $validatedData['category'];
      $transaction->cashFlow = $validatedData['cashFlow'];
      $transaction->productLine = $validatedData['productLine'];

      // Check if the invoice number and selected transactions are provided
      if (isset($validatedData['invoiceNumber']) && $validatedData['transactionStatus'] === 'To Settle' && isset($validatedData['selectedTransactions'])) {
          // Set the invoice number for the new transaction
          $transaction->invoice_number = $validatedData['invoiceNumber'];

          // Loop through the selected transactions and update their status and invoice number
          $selectedTransactions = $validatedData['selectedTransactions'];
          foreach ($selectedTransactions as $selectedTransaction) {
              // Update the selected transactions that are "Unsettled"
              Transaction::where('id', $selectedTransaction['id'])
                  ->where('status', 'Unsettled')
                  ->update([
                      'status' => 'To Settle',
                      'invoice_number' => $validatedData['invoiceNumber']
                  ]);
          }
      }

      // Save the new transaction
      $transaction->save();

      // Handle material creation if provided
      if (isset($validatedData['materials'])) {
          foreach ($validatedData['materials'] as $materialData) {
              $material = new Materials(); // Assuming Material is the model for materials
              $material->transaction_id = $transaction->id;
              $material->name = $materialData['name'];
              $material->price = $materialData['price'];
              $material->quantity = $materialData['quantity'];
              $material->save();
          }
      }

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
      if (isset($validatedData['clientID']) && isset($validatedData['projectID'])) {
          $clientTransactionRequest->clientID = $validatedData['clientID'];
          $clientTransactionRequest->projectID = $validatedData['projectID'];
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

        // Order by transaction status in descending order
        $query->orderByDesc('transaction.status'); // Order by status in descending order

        // Execute the query and get transactions
        $transactions = $query->get();

        // Loop through transactions and add materials for each
        $transactions->each(function ($transaction) {
            // Eager load the materials for this transaction
            $transaction->materials = Materials::where('transaction_id', $transaction->id)->get();
        });

        // Return the transactions with materials included
        return response()->json($transactions);
    }

    public function getTransactionsByInvoiceNumber(Request $request)
    {
        // Get the invoice number from the request
        $invoiceNumber = $request->input('invoiceNumber');
        
        // Start building the query for transactions
        $query = Transaction::query();
        
        // Add left joins with related tables to allow nullable clientID and projectID
        $query->leftJoin('users', 'transaction.clientID', '=', 'users.id')
            ->leftJoin('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->leftJoin('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->leftJoin('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->leftJoin('project', 'transaction.projectID', '=', 'project.id') // Left join with the project table
            ->leftJoin('materials', 'transaction.id', '=', 'materials.transaction_id'); // Left join with materials table

        // Select the transaction details, including material details like name, price, quantity
        $query->select(
            'transaction.*', 
            'users.company', 
            'transactiontype.description as transactionType', 
            'project.projectName',
            'materials.id as material_id', 
            'materials.name as material_name', 
            'materials.price as material_price', 
            'materials.quantity as material_quantity', 
            'materials.created_at as material_created_at', 
            'materials.updated_at as material_updated_at'
        );

        // Add the filter for the invoice number
        if ($invoiceNumber) {
            $query->where('transaction.invoice_number', '=', $invoiceNumber);
        }

        // Filter for approved transactions (if needed)
        $query->where('clienttransctionrequest.status', 'Approved');
        $query->where('transaction.isDeleted', 0); // Ensure we're not getting deleted transactions

        // Execute the query and get the results
        $transactions = $query->get();

        // Group the results by transaction ID to organize materials under each transaction
        $groupedTransactions = $transactions->groupBy('id')->map(function ($transactionGroup) {
            $transaction = $transactionGroup->first(); // Get the first transaction of the group
            $materials = $transactionGroup->map(function ($item) {
                return [
                    'transaction_id' => $item->id,
                    'name' => $item->material_name,
                    'price' => $item->material_price,
                    'quantity' => $item->material_quantity,
                    'created_at' => $item->material_created_at,
                    'updated_at' => $item->material_updated_at
                ];
            });

            // Remove material-related fields from the transaction details
            unset($transaction->material_id, $transaction->material_name, $transaction->material_price, $transaction->material_quantity, $transaction->material_created_at, $transaction->material_updated_at);

            // Add the materials to the transaction data
            $transaction->materials = $materials;

            return $transaction;
        });

        // Return the grouped transactions as a JSON response
        return response()->json($groupedTransactions);
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
    $month = $request->input('month'); // For weeks, the month is provided
    $year = $request->input('year');  // Year input
    $rangeType = $request->input('rangeType'); // This can be 'week', 'month', or 'year'

    // Start by preparing the basic query
    $query = DB::table('transaction')
        ->select(
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
                              THEN transaction.amount ELSE 0 END) as totalExpense'),
            DB::raw('SUM(CASE WHEN transactiontype.description IN ("Revenue", "Sale", "Payment") 
                              AND NOT EXISTS (
                                  SELECT 1 FROM transactiontransactiontype ttt 
                                  JOIN transactiontype tt ON ttt.transactionTypeID = tt.id
                                  WHERE ttt.transactionID = transaction.id 
                                  AND tt.description IN ("Liabilities", "Asset", "Equity")
                              ) 
                              THEN transaction.amount ELSE 0 END) - 
                    SUM(CASE WHEN transactiontype.description IN ("Expense", "Purchase", "Loan") 
                              AND NOT EXISTS (
                                  SELECT 1 FROM transactiontransactiontype ttt 
                                  JOIN transactiontype tt ON ttt.transactionTypeID = tt.id
                                  WHERE ttt.transactionID = transaction.id 
                                  AND tt.description IN ("Liabilities", "Asset", "Equity")
                              ) 
                              THEN transaction.amount ELSE 0 END) as profit')
        )
        ->leftJoin('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->leftJoin('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->leftJoin('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID') // Join with clientTransactionRequest
        ->where('clienttransctionrequest.status', 'Approved') // Filter for approved transactions
        ->where('transaction.isDeleted', 0);

    // Adjust the query based on the rangeType
    if ($rangeType == 'week') {
        // Filter strictly for the specified month and year, then group by the week number within that month
        $query->whereYear('transaction.created_at', $year)
              ->whereMonth('transaction.created_at', $month)
              ->whereBetween(DB::raw('WEEK(transaction.created_at, 1)'), [1, 52]) // Restrict to weeks 1-52
              ->groupBy(DB::raw('WEEK(transaction.created_at, 1)')) // Group by week number
              ->addSelect(DB::raw('WEEK(transaction.created_at, 1) as week'));
    } elseif ($rangeType == 'month') {
        // Filter strictly for the specified year, then group by the month
        $query->whereYear('transaction.created_at', $year)
              ->whereMonth('transaction.created_at', $month) // Ensure we're within the correct month
              ->groupBy(DB::raw('MONTH(transaction.created_at)'))
              ->addSelect(DB::raw('MONTH(transaction.created_at) as month'));
    } elseif ($rangeType == 'year') {
        // Filter strictly for the specified year, then group by the year
        $query->whereYear('transaction.created_at', $year)
              ->groupBy(DB::raw('YEAR(transaction.created_at)'))
              ->addSelect(DB::raw('YEAR(transaction.created_at) as year'));
    }

    // Execute the query and get the results
    $processedReportData = $query->get();

    // Return the results as a JSON response
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
        $assetTypes = ['Asset', 'Receivable'];
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
            ->select('transaction.description', 'transaction.amount', 'transactiontype.description as transactionType', 'transaction.transactionDate as date')
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
            ->select('transaction.description', 'transaction.amount', 'transaction.transactionDate as date')
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
            ->select('transaction.description', 'transaction.amount', 'transaction.transactionDate as date')
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
            // Get the custom date range from the request
            $fromDate = $request->input('dateFrom');
            $toDate = $request->input('dateTo');
            $rangeType = $request->input('rangeType'); // 'month' or 'year'

            // Adjust the provided dates to include entire days (if needed)
            $fromDate = date('Y-m-d H:i:s', strtotime($fromDate . ' 00:00:00'));
            $toDate = date('Y-m-d H:i:s', strtotime($toDate . ' 23:59:59'));

            // Retrieve the list of revenues for the custom date range
            $revenues = $this->getRevenues($fromDate, $toDate);

            // Calculate total revenue for the custom date range
            $totalRevenue = $revenues->sum('amount');

            // Retrieve and calculate total operating, financing, and investing expenses for the custom date range
            $operatingExpenses = $this->getExpenses($fromDate, $toDate, 'Operating');
            $totalOperatingExpenses = $operatingExpenses->sum('amount');

            $financingExpenses = $this->getExpenses($fromDate, $toDate, 'Financing');
            $totalFinancingExpenses = $financingExpenses->sum('amount');

            $investingExpenses = $this->getExpenses($fromDate, $toDate, 'Investing');
            $totalInvestingExpenses = $investingExpenses->sum('amount');

            // Calculate net income for the custom date range
            $netIncome = $totalRevenue - ($totalOperatingExpenses + $totalFinancingExpenses + $totalInvestingExpenses);

            // If the range is monthly, annualize the income and expenses
            if ($rangeType == 'month') {
                // Annualize the revenue and expenses (multiply by 12)
                $annualNetIncome = $netIncome * 12;

                // Calculate income tax based on the annual income
                $annualIncomeTax = $this->calculateIncomeTax($annualNetIncome);
                $incomeTax = $annualIncomeTax/12;

                // Calculate net income after tax for the current month
                $netIncomeAfterTax = $netIncome - $incomeTax;
            } else {
                // For a yearly range, just use the calculated net income and income tax for that range
                $incomeTax = $this->calculateIncomeTax($netIncome);
                $netIncomeAfterTax = $netIncome - $incomeTax;
            }

            // Prepare the summary data to return to the frontend
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
                'incomeTax' => $incomeTax,
                'netIncomeAfterTax' => $netIncomeAfterTax,
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

    // Helper function to retrieve revenues for a given date range
    private function getRevenues($fromDate, $toDate)
    {
        return Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved')
            ->whereIn('transactiontype.description', ['Revenue', 'Sale', 'Payment'])
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->select('transaction.description', 'transaction.amount', 'transaction.transactionDate as date')
            ->get();
    }

    // Helper function to retrieve expenses for a given date range and category
    private function getExpenses($fromDate, $toDate, $category)
    {
        return Transaction::join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
            ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
            ->join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
            ->where('transaction.isDeleted', 0)
            ->where('clienttransctionrequest.status', 'Approved')
            ->whereIn('transactiontype.description', ['Expense', 'Purchase'])
            ->where('transaction.category', $category)
            ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
            ->select('transaction.description', 'transaction.amount', 'transaction.transactionDate as date')
            ->get();
    }

    // Helper function to calculate income tax based on annual income
    private function calculateIncomeTax($annualIncome)
    {
        if ($annualIncome <= 250000) {
            return 0; // No tax
        } elseif ($annualIncome <= 400000) {
            return ($annualIncome - 250000) * 0.20; // 20% of the excess over 250000
        } elseif ($annualIncome <= 800000) {
            return 30000 + ($annualIncome - 400000) * 0.25; // 30,000 + 25% of the excess over 400000
        } elseif ($annualIncome <= 2000000) {
            return 130000 + ($annualIncome - 800000) * 0.30; // 130,000 + 30% of the excess over 800000
        } elseif ($annualIncome <= 8000000) {
            return 490000 + ($annualIncome - 2000000) * 0.32; // 490,000 + 32% of the excess over 2000000
        } else {
            return 2410000 + ($annualIncome - 8000000) * 0.35; // 2.41M + 35% of the excess over 8000000
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

    // Fetch operating activities excluding 'Receivable' transaction type
    $operatingActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Operating')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();

    // Calculate operating income activities excluding 'Receivable' transaction type
    $operatingIncomeActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Operating')
        ->where('transaction.cashFlow', 'Inflow')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();
    $operatingIncome = $operatingIncomeActivities->sum('amount');

    // Calculate operating expenses activities excluding 'Receivable' transaction type
    $operatingExpenseActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Operating')
        ->where('transaction.cashFlow', 'Outflow')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();
    $operatingExpenses = $operatingExpenseActivities->sum('amount');

    $operatingNetCashflow = $operatingIncome - $operatingExpenses;

    // Fetch investing activities excluding 'Receivable' transaction type
    $investingActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Investing')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();

    // Calculate investing income activities excluding 'Receivable' transaction type
    $investingIncomeActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Investing')
        ->where('transaction.cashFlow', 'Inflow')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();
    $investingIncome = $investingIncomeActivities->sum('amount');

    // Calculate investing expenses activities excluding 'Receivable' transaction type
    $investingExpenseActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Investing')
        ->where('transaction.cashFlow', 'Outflow')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();
    $investingExpenses = $investingExpenseActivities->sum('amount');

    $investingNetCashflow = $investingIncome - $investingExpenses;

    // Fetch financing activities excluding 'Receivable' transaction type
    $financingActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Financing')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();

    // Calculate financing income activities excluding 'Receivable' transaction type
    $financingIncomeActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Financing')
        ->where('transaction.cashFlow', 'Inflow')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
        ->get();
    $financingIncome = $financingIncomeActivities->sum('amount');

    // Calculate financing expenses activities excluding 'Receivable' transaction type
    $financingExpenseActivities = Transaction::join('clienttransctionrequest', 'transaction.id', '=', 'clienttransctionrequest.transactionID')
        ->join('transactiontransactiontype', 'transaction.id', '=', 'transactiontransactiontype.transactionID')
        ->join('transactiontype', 'transactiontransactiontype.transactionTypeID', '=', 'transactiontype.id')
        ->whereBetween('transaction.transactionDate', [$fromDate, $toDate])
        ->where('transaction.isDeleted', 0)
        ->where('clienttransctionrequest.status', 'Approved')
        ->where('transaction.category', 'Financing')
        ->where('transaction.cashFlow', 'Outflow')
        ->whereNotIn('transactiontype.description', ['Receivable']) // Exclude 'Receivable'
        ->select('transaction.*')
        ->distinct()  // Ensure distinct transactions
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
            ->with(['client', 'project', 'transaction', 'approver'])
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
            'approverID' => 'required',
            'transactionID' => 'required',
            'paymentAmount' => 'required',
        ]);

        // Find the payment record by paymentID
        $payment = Payment::where('id', $validated['paymentID'])->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        // Find the transaction record by transactionID
        $transaction = Transaction::where('id', $validated['transactionID'])->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // If the status is 'Declined', insert the decline reason
        if ($validated['status'] === 'Declined') {
            $user = User::find($validated['clientID']);
            Mail::send('emails.decline-payment', ['user' => $user], function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Your Payment Request Has Been Declined');
            });

            // Send SMS notification for declined status
            $this->sendSms($user->contact, 'Your Payment Request has been declined.');

            // Insert the reason into the paymentDeclineReason table
            $declineReason = $validated['decline_reason'];
            \DB::table('paymentDeclineReason')->insert([
                'paymentID' => $payment->id,
                'reason' => $declineReason,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($validated['status'] === 'Approved') {
            $user = User::find($validated['clientID']);
            Mail::send('emails.approve-payment', ['user' => $user], function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Your Payment Request Has Been Approved');
            });

            // Send SMS notification for approved status
            $this->sendSms($user->contact, 'Congratulations! Your Payment Request has been approved.');

            // Subtract the payment amount from the transaction balance
            $transaction->amount -= $validated['paymentAmount'];
            $transaction->save();

            // Check if the transaction amount is 0, and update the status to 'Settled'
            if ($transaction->amount <= 0) {
                // Get all transactions with the same invoice number
                $allTransactionsViaInvoiceNumber = Transaction::where('invoice_number', $transaction->invoice_number)->get();
                
                // Loop through all transactions and update their status to 'Settled'
                foreach ($allTransactionsViaInvoiceNumber as $trans) {
                    $trans->status = 'Settled';
                    $trans->save();
                }
            }
        }

        // Update the payment status
        $payment->status = $validated['status'];
        $payment->approver_id = $validated['approverID'];
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
            'receiptNumber' => 'required',
            'paymentTerm' => 'required|string',
            'paymentMethod' => 'required|string',
            'amount' => 'required|numeric', // Ensure valid amount
        ]);

        // Create a new payment record
        $payment = Payment::create([
            'clientID' => $validated['clientID'],
            'projectID' => $validated['projectID'],
            'transactionID' => $validated['transactionID'],
            'receipt_number' => $validated['receiptNumber'],
            'payment_term' => $validated['paymentTerm'],
            'payment_method' => $validated['paymentMethod'],
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
