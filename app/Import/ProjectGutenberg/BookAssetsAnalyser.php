<?php

declare(strict_types=1);

namespace App\Import\ProjectGutenberg;

use App\Import\BookAsset;
use function tap;

class BookAssetsAnalyser
{
    private const ASSETS_TO_LOOK_FOR = [
        'pg%s.epub' => BookAsset::ASSET_TYPE_EPUB,
        'pg%s.mobi' => BookAsset::ASSET_TYPE_MOBI,
        'pg%s.cover.medium.jpg' => BookAsset::ASSET_TYPE_COVER,
        'pg%s.txt.utf8' => BookAsset::ASSET_TYPE_BOOK_AS_TXT,
    ];

    /**
     * @return BookAsset[]
     */
    public static function analyseBookAssets(string $rdfFilePath, string $bookGutenbergId): array
    {
        $assets = [];
        $rdfDir = dirname($rdfFilePath);

        $idInteger = (int) str_replace('pg-', '', $bookGutenbergId);

        foreach (self::ASSETS_TO_LOOK_FOR as $assetFilePattern => $assetType) {
            $assetPath = $rdfDir . DIRECTORY_SEPARATOR . sprintf($assetFilePattern, $idInteger);
            if (file_exists($assetPath)) {
                $assets[] = tap(new BookAsset(), function (BookAsset $asset) use ($assetPath, $assetType) {
                    $asset->type = $assetType;
                    $asset->path = realpath($assetPath);
                    $asset->size = filesize($assetPath);
                });
            }
        }

        return $assets;
    }
}
