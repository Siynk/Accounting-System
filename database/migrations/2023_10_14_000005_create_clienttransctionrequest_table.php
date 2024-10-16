<?php
// 2023_10_14_000002_create_clienttransctionrequest_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClientTransctionRequestTable extends Migration
{
    public function up()
    {
        Schema::create('clienttransctionrequest', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clientID');
            $table->unsignedBigInteger('transactionID');
            $table->string('status', 50);
            $table->string('action', 50);
            $table->date('requestDate')->default(now());
            $table->foreign('clientID')->references('id')->on('users')->onDelete('no action')->onUpdate('no action');
            $table->foreign('transactionID')->references('id')->on('transaction')->onDelete('no action')->onUpdate('no action');

            // Adding created_at and updated_at fields
            $table->date('created_at')->default(now());
            $table->date('updated_at')->default(now());
        });
    }

    public function down()
    {
        Schema::dropIfExists('clienttransctionrequest');
    }
}