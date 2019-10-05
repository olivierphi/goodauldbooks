<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Library\BookMetadata.
 *
 * @property int $book_id
 * @property int $has_cover
 * @property int|null $epub_size
 * @property int|null $mobi_size
 * @property string|null $intro
 *
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata whereBookId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata whereEpubSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata whereHasCover($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata whereIntro($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\BookMetadata whereMobiSize($value)
 * @mixin \Eloquent
 */
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
