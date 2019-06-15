<?php

namespace App\Import;

class ParsedBook
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
     * @var string
     */
    public $lang;
    /**
     * @var ParsedBookAuthor[]
     */
    public $authors = [];
    /**
     * @var ParsedGenre[]
     */
    public $genres = [];
}
