<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
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

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
