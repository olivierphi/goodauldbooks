<?php

namespace App\Import;

class BookAsset
{
    public const ASSET_TYPE_EPUB = 'EPUB';
    public const ASSET_TYPE_MOBI = 'MOBI';
    public const ASSET_TYPE_COVER = 'COVER';
    public const ASSET_TYPE_BOOK_AS_TXT = 'TEXT';

    /**
     * @var string on of ASSET_TYPE_*
     */
    public $type;
    /**
     * @var string
     */
    public $path;
    /**
     * @var int the asset size, in bytes
     */
    public $size;
}
