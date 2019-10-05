<?php

namespace App\Library;

use Illuminate\Database\Eloquent\Model;

/**
 * App\Library\Genre.
 *
 * @property int $id
 * @property string $public_id
 * @property string $name
 * @property string $slug
 *
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Genre newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Genre newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Genre query()
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Genre whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Genre whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Genre wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|\App\Library\Genre whereSlug($value)
 * @mixin \Eloquent
 */
class Genre extends Model
{
    public $timestamps = false;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
