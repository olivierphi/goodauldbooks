<?php

namespace App\Import;

class BookToImport
{
    /**
     * @var string
     */
    public $id;
    /**
     * @var string
     */
    public $title;
    /**
     * @var string|null
     */
    public $subtitle;
    /**
     * @var string
     */
    public $lang;
    /**
     * @var AuthorToImport[]
     */
    public $authors = [];
    /**
     * @var GenreToImport[]
     */
    public $genres = [];
    /**
     * @var BookAsset[]
     */
    public $assets = [];
}
