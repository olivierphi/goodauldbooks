<?php

namespace App\Import;

class ParsedBookAuthor
{
    /**
     * @var string|null
     */
    public $id;
    /**
     * @var string|null
     */
    public $firstName;
    /**
     * @var string|null
     */
    public $lastName;
    /**
     * @var string|null
     */
    public $alias;
    /**
     * @var int|null
     */
    public $birthYear;
    /**
     * @var int|null
     */
    public $deathYear;
}
