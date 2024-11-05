<?php
// 2023_10_14_000005_create_modules_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectTable extends Migration
{
    public function up()
    {
        Schema::create('project', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('clientID')->default(0);
            $table->string('projectName', 50);
            $table->string('status', 200);
            $table->foreign('clientID')->references('id')->on('users')->onDelete('no action')->onUpdate('no action');
            
            // Adding created_at and updated_at fields
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

        });
    }

    public function down()
    {
        Schema::dropIfExists('project');
    }
}
