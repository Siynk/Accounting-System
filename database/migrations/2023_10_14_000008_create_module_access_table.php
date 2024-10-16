<?php
// 2023_10_14_000006_create_module_access_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateModuleAccessTable extends Migration
{
    public function up()
    {
        Schema::create('module_access', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->integer('module_id');
            $table->boolean('hasAccess');

            // Adding created_at and updated_at fields
            $table->date('created_at')->default(now());
            $table->date('updated_at')->default(now());
        });
    }

    public function down()
    {
        Schema::dropIfExists('module_access');
    }
}
