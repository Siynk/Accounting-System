<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentDeclineReasonsTable extends Migration
{
    public function up()
    {
        Schema::create('paymentDeclineReason', function (Blueprint $table) {
            $table->id();  // Auto-incrementing id
            $table->unsignedBigInteger('paymentID');  // Foreign key to payment table
            $table->string('reason', 255);  // Reason for payment decline
            $table->timestamps();  // created_at and updated_at

            // Foreign key constraint
            $table->foreign('paymentID')->references('id')->on('payment')
                  ->onDelete('cascade') // Cascade delete if the payment is deleted
                  ->onUpdate('cascade'); // Cascade update if paymentID is updated
        });
    }

    public function down()
    {
        Schema::dropIfExists('paymentDeclineReason');
    }
}
