<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    public function books()
    {
        return $this->belongsToMany(Book::class, 'authors_books');
    }
}
