<?php

namespace App\Library;

use function collect;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Library\Author.
 *
 * @property int $id
 * @property string $public_id
 * @property string|null $first_name
 * @property string|null $last_name
 * @property int|null $birth_year
 * @property int|null $death_year
 * @property string $slug
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property \Illuminate\Database\Eloquent\Collection|\App\Library\Book[] $books
 * @property int|null $books_count
 * @property mixed $full_name
 *
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereBirthYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereDeathYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Author whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
