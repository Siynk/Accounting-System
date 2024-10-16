<?php
// 2023_10_14_000012_create_transactiontransactiontype_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionTransactionTypeTable extends Migration
{
    public function up()
    {
        Schema::create('transactiontransactiontype', function (Blueprint $table) {
            $table->unsignedBigInteger('transactionID')->nullable();
            $table->unsignedBigInteger('transactionTypeID')->nullable();

            // Adding created_at and updated_at fields
            $table->date('created_at')->default(now());
            $table->date('updated_at')->default(now());

            // Adding foreign keys if needed
            // $table->foreign('transactionID')->references('id')->on('transaction')->onDelete('cascade')->onUpdate('cascade');
            // $table->foreign('transactionTypeID')->references('id')->on('transactiontype')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transactiontransactiontype');
    }
}
