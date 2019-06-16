<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGenresTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('genres', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('public_id', 15)->unique();
            $table->string('name');
            $table->string('slug')->unique();
        });

        Schema::create('books_genres', function (Blueprint $table) {
            $table->integer('book_id')->unsigned();
            $table->integer('genre_id')->unsigned();

            $table->foreign('book_id')->references('id')->on('books')->onDelete('cascade');
            $table->foreign('genre_id')->references('id')->on('genres')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('books_genres');
        Schema::dropIfExists('genres');
    }
}
