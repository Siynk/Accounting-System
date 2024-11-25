<?php
// 2023_10_14_000011_create_transaction_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionTable extends Migration
{
    public function up()
    {
        Schema::create('transaction', function (Blueprint $table) {
            $table->id();
            $table->string('description');
            $table->string('productLine', 50);
            // Gawing nullable ang clientID at projectID at gawing default 0
            $table->unsignedBigInteger('clientID')->nullable()->default(0);
            $table->unsignedBigInteger('projectID')->nullable()->default(0);
            $table->decimal('amount', 10, 0);
            $table->decimal('fee', 10, 0);
            $table->string('category', 50);
            $table->string('cashFlow', 50);
            $table->boolean('isDeleted')->default(0);
            // Alisin ang foreign key constraints
            // $table->foreign('clientID')->references('id')->on('users')->onDelete('no action')->onUpdate('no action');
            // $table->foreign('projectID')->references('id')->on('project')->onDelete('no action')->onUpdate('no action');

            // Adding transactionDate, created_at, and updated_at fields
            $table->timestamp('transactionDate')->nullable()->useCurrent();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transaction');
    }
}
