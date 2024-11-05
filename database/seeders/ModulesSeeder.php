<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModulesSeeder extends Seeder
{
    public function run()
    {
        DB::table('modules')->insert([
            ['id' => 1, 'description' => 'Add New Admin', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 2, 'description' => 'Dashboard', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 3, 'description' => 'Client Management', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 4, 'description' => 'Transactions', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 5, 'description' => 'Reports', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 6, 'description' => 'Balance Sheet', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 7, 'description' => 'Income Statement', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 8, 'description' => 'Cashflow Statement', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 9, 'description' => 'Trend Analysis', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 10, 'description' => 'Segment Report', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
            ['id' => 11, 'description' => 'Manage Project', 'created_at' => '2024-10-11', 'updated_at' => '2024-10-11'],
        ]);
    }
}
