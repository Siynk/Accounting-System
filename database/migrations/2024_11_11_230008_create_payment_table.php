<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentTable extends Migration
{
    public function up()
    {
        Schema::create('payment', function (Blueprint $table) {
            $table->id(); // Auto-incrementing id
            $table->unsignedBigInteger('clientID'); // Foreign key to users.id
            $table->unsignedBigInteger('projectID'); // Foreign key to project.id
            $table->unsignedBigInteger('transactionID'); // Foreign key to transaction.id (new field)
            $table->decimal('amount', 10, 2); // Field for the payment amount
            $table->string('status', 50); // Field for the payment status
            $table->timestamps(); // Adds 'created_at' and 'updated_at' fields

            // Foreign key constraints
            $table->foreign('clientID')->references('id')->on('users')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('projectID')->references('id')->on('project')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('transactionID')->references('id')->on('transaction')->onDelete('cascade')->onUpdate('cascade'); // New foreign key
        });
    }

    public function down()
    {
        Schema::dropIfExists('payment');
    }
}
