<?php
// 2023_10_14_000001_create_clientregistrationrequest_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClientRegistrationRequestTable extends Migration
{
    public function up()
    {
        Schema::create('clientregistrationrequest', function (Blueprint $table) {
            $table->id();
            $table->string('status', 50)->default('Pending');
            $table->unsignedBigInteger('userID');
            $table->date('requestDate')->default(now());
            $table->foreign('userID')->references('id')->on('users')->onDelete('no action')->onUpdate('no action');

            // Adding created_at and updated_at fields
            $table->date('created_at')->default(now());
            $table->date('updated_at')->default(now());
        });
    }

    public function down()
    {
        Schema::dropIfExists('clientregistrationrequest');
    }
}
