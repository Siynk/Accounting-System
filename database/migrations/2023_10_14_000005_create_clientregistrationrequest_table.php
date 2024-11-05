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
            $table->timestamp('requestDate')->nullable()->useCurrent();
            $table->foreign('userID')->references('id')->on('users')->onDelete('no action')->onUpdate('no action');

            // Adding created_at and updated_at fields
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

        });
    }

    public function down()
    {
        Schema::dropIfExists('clientregistrationrequest');
    }
}
