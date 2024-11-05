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
            $table->timestamp('editDate')->nullable()->useCurrent();
            $table->foreign('transactionID')->references('id')->on('transaction')->onDelete('no action')->onUpdate('no action');
            $table->foreign('clientID')->references('id')->on('users')->onDelete('no action')->onUpdate('no action');

            // Adding created_at and updated_at fields
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

        });
    }

    public function down()
    {
        Schema::dropIfExists('temporarytransactionedits');
    }
}
