<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Model;

class BookMetadata extends Model
{
    public $timestamps = false;
    protected $table = 'books_metadata';
    protected $primaryKey = 'book_id';

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];
}
