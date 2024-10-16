<?php
// 2023_10_14_000013_create_transactiontype_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionTypeTable extends Migration
{
    public function up()
    {
        Schema::create('transactiontype', function (Blueprint $table) {
            $table->id();
            $table->string('description', 100);
            $table->integer('isDeleted')->default(0);
            
            // Adding created_at and updated_at fields
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

        });
    }

    public function down()
    {
        Schema::dropIfExists('transactiontype');
    }
}
