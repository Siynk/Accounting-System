<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionTypeSeeder extends Seeder
{
    public function run()
    {
        DB::table('transactiontype')->insert([
            ['id' => 1, 'description' => 'Asset', 'isDeleted' => 0],
            ['id' => 2, 'description' => 'Liabilities', 'isDeleted' => 0],
            ['id' => 3, 'description' => 'Equity', 'isDeleted' => 0],
            ['id' => 4, 'description' => 'Revenue', 'isDeleted' => 0],
            ['id' => 5, 'description' => 'Expense', 'isDeleted' => 0],
            ['id' => 6, 'description' => 'Sale', 'isDeleted' => 0],
            ['id' => 7, 'description' => 'Purchase', 'isDeleted' => 0],
            ['id' => 8, 'description' => 'Loan', 'isDeleted' => 0],
            ['id' => 9, 'description' => 'Dividends', 'isDeleted' => 0],
            ['id' => 10, 'description' => 'Payment', 'isDeleted' => 0],
        ]);
    }
}
