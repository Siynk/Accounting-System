<?php
// 2023_10_14_000009_create_request_access_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequestAccessTable extends Migration
{
    public function up()
    {
        Schema::create('request_access', function (Blueprint $table) {
            $table->id();
            $table->integer('module_id');
            $table->integer('user_id');
            $table->string('status', 50);

            // Adding created_at and updated_at fields
            $table->date('created_at')->default(now());
            $table->date('updated_at')->default(now());
        });
    }

    public function down()
    {
        Schema::dropIfExists('request_access');
    }
}
