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
     * @var ParsedAuthor[]
     */
    public $authors = [];
    /**
     * @var ParsedGenre[]
     */
    public $genres = [];
}
