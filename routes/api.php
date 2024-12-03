<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::middleware('auth:sanctum')->group(function () {
    Route::get('logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('update-user', [UserController::class, 'updateUser']);
    Route::post('add-user', [UserController::class, 'addUser']);
    Route::post('add-project', [UserController::class, 'addProject']);
    Route::post('update-project-status', [UserController::class, 'updateProjectStatus']);
    Route::get('get-approved-projects', [UserController::class, 'getApprovedProjects']);
    Route::get('get-pending-projects', [UserController::class, 'getPendingProjects']);
    Route::post('add-transaction', [TransactionController::class, 'addTransaction']);
    Route::get('get-all-transactions', [TransactionController::class, 'getAllTransactions']);
    Route::get('get-counts', [TransactionController::class, 'getCounts']);
    Route::post('filter-transactions', [TransactionController::class, 'filterTransactions']);
    Route::get('get-transactions-by-invoice-number', [TransactionController::class, 'getTransactionsByInvoiceNumber']);
    Route::post('update-transaction', [TransactionController::class, 'updateTransaction']);
    Route::get('get-all-clients', [UserController::class, 'getAllClients']);
    Route::post('delete-transaction', [TransactionController::class, 'deleteTransaction']);
    Route::post('delete-user', [UserController::class, 'deleteUser']);
    Route::post('filter-clients', [UserController::class, 'filterClients']);
    Route::post('generate-trend-analysis-report', [TransactionController::class, 'generateTrendAnalysisReport']);
    Route::post('generate-balance-sheet', [TransactionController::class, 'generateBalanceSheet']);
    Route::post('generate-income-statement', [TransactionController::class, 'generateIncomeStatement']);
    Route::post('generate-cashflow-statement', [TransactionController::class, 'getCashflowData']);
    Route::post('generate-segment-report', [TransactionController::class, 'getSegmentReportData']);
    Route::get('get-all-admin', [UserController::class, 'getAllAdmin']);
    Route::post('add-new-access', [UserController::class, 'addNewAccess']);
    Route::post('update-access', [UserController::class, 'updateAccess']);
    Route::get('get-modules', [UserController::class, 'getModules']);
    Route::post('request-access', [UserController::class, 'requestAccess']);
    route::get('/pending-request-access', [UserController::class, 'getPendingRequestAccess']);
    route::post('/approve-pending-access-request', [UserController::class, 'approvePendingAccessRequest']);
    Route::post('/decline-pending-access-request', [UserController::class, 'declinePendingAccessRequest']);
    route::get('/client-registration-requests/pending', [UserController::class, 'getPendingClientRegistrationRequests']);
    Route::post('/client-registration-request/respond', [UserController::class, 'respondToClientRequest']);
    route::get('/client-pending-transaction-requests', [TransactionController::class, 'getClientPendingTransactionRequests']);
    Route::get('/pending-temporary-transaction-edits', [TransactionController::class, 'getPendingTemporaryTransactionEdits']);
    Route::post('/transaction-request/respond', [TransactionController::class, 'respondToPendingTransactionRequest']);
    Route::post('/transaction-edit/respond', [TransactionController::class, 'respondToPendingTransactionEdit']);
    Route::post('/pay-transaction', [TransactionController::class, 'createPayment']);
    Route::get('/get-all-payments', [TransactionController::class, 'getAllPayments']);
    Route::post('/update-payment', [TransactionController::class, 'updatePaymentStatus']);
});
Route::post('register-client', [UserController::class, 'registerClient']);
Route::post('send-forgot-password-email', [UserController::class, 'sendForgotPasswordEmail']);
Route::post('login', [AuthController::class, 'login']);
Route::get('get-access', [UserController::class, 'getAccess']); // Changed to GET
