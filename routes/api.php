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
    Route::post('add-transaction', [TransactionController::class, 'addTransaction']);
    Route::get('get-all-transactions', [TransactionController::class, 'getAllTransactions']);
    Route::get('get-counts', [TransactionController::class, 'getCounts']);
    Route::post('filter-transactions', [TransactionController::class, 'filterTransactions']);
    Route::post('update-transaction', [TransactionController::class, 'updateTransaction']);
    Route::get('get-all-clients', [UserController::class, 'getAllClients']);
    Route::post('delete-transaction', [TransactionController::class, 'deleteTransaction']);
});
Route::post('register-client', [UserController::class, 'registerClient']);
Route::post('login', [AuthController::class, 'login']);
