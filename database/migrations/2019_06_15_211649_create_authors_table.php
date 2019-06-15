<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAuthorsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('authors', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('public_id')->unique();
            // Not all heroes wear capes, and not all authors have (known) names...
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->integer('birth_year')->nullable();
            $table->integer('death_year')->nullable();
            $table->string('slug')->unique();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('authors_books', function (Blueprint $table) {
            $table->integer('author_id')->unsigned();
            $table->integer('book_id')->unsigned();

            $table->foreign('author_id')->references('id')->on('authors')->onDelete('cascade');
            $table->foreign('book_id')->references('id')->on('books')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('authors');
        Schema::dropIfExists('authors_books');
    }
}
