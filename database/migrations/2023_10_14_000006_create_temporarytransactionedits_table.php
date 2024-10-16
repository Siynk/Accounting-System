<?php
// 2023_10_14_000010_create_temporarytransactionedits_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTemporaryTransactionEditsTable extends Migration
{
    public function up()
    {
        Schema::create('temporarytransactionedits', function (Blueprint $table) {
            $table->id();
            $table->string('newDescription');
            $table->unsignedBigInteger('clientID')->default(0);
            $table->decimal('newAmount', 10, 0);
            $table->string('status', 50);
            $table->unsignedBigInteger('transactionID');
            $table->date('editDate')->default(now());
            $table->foreign('transactionID')->references('id')->on('transaction')->onDelete('no action')->onUpdate('no action');
            $table->foreign('clientID')->references('id')->on('users')->onDelete('no action')->onUpdate('no action');

            // Adding created_at and updated_at fields
            $table->date('created_at')->default(now());
            $table->date('updated_at')->default(now());
        });
    }

    public function down()
    {
        Schema::dropIfExists('temporarytransactionedits');
    }
}
