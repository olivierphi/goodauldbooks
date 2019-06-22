<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    /**
     * The relationships that should always be loaded.
     *
     * @var array
     */
    protected $with = ['authors', 'genres'];

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    public function authors()
    {
        return $this->belongsToMany(Author::class, 'authors_books');
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'books_genres');
    }

    public function metadata()
    {
        return $this->hasOne(BookMetadata::class, 'book_id');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
