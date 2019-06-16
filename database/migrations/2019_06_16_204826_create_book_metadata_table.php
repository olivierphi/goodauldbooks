<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBookMetadataTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('books_metadata', function (Blueprint $table) {
            $table->bigInteger('book_id')->unsigned();
            $table->boolean('has_cover');
            $table->unsignedInteger('epub_size')->nullable();
            $table->unsignedInteger('mobi_size')->nullable();
            $table->text('intro')->nullable();

            $table->foreign('book_id')->references('id')->on('books')->onDelete('cascade');
            $table->primary('book_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('books_metadata');
    }
}
