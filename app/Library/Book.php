<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Library\Book.
 *
 * @property int $id
 * @property string $public_id
 * @property string $title
 * @property string|null $subtitle
 * @property string $lang
 * @property string $slug
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property \Illuminate\Database\Eloquent\Collection|\App\Library\Author[] $authors
 * @property int|null $authors_count
 * @property \Illuminate\Database\Eloquent\Collection|\App\Library\Genre[] $genres
 * @property int|null $genres_count
 * @property \App\Library\BookMetadata $metadata
 *
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereLang($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereSubtitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Book whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
