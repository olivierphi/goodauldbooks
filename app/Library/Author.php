<?php

namespace App\Library;

use function collect;
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

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', collect([$this->first_name, $this->last_name])->filter()->all()));
    }
}
