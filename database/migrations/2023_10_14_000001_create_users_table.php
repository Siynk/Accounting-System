<?php
// 2023_10_14_000014_create_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('userType', 50);
            $table->string('address', 255);
            $table->string('email', 50);
            $table->string('contact', 50);
            $table->string('company', 255)->nullable();
            $table->boolean('isDeleted')->default(0);
            
            // Adding created_at and updated_at fields
            $table->date('created_at')->default(now());
            $table->date('updated_at')->default(now());
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
