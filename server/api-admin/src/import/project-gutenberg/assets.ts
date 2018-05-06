import { BookAssetType, ImportedBookAsset } from "../../domain/import";
import * as asyncUtils from "../../utils/async-utils";

const ASSETS_TYPES_FILES_REGEXPS: { [type: /*BookAssetType*/ string]: RegExp } = {
  [BookAssetType.COVER]: /^pg\d+\.cover\.medium\.jpg$/,
  [BookAssetType.EPUB]: /^pg\d+-images\.epub$/,
  [BookAssetType.MOBI]: /^pg\d+-images\.mobi$/,
  [BookAssetType.TXT]: /^pg\d+\.txt\.utf8$/,
};

export async function getImportedBookAssets(
  bookAssetsAbsoluteFolderPath: string,
  bookAssetsCommonFolderPath: string
): Promise<ImportedBookAsset[]> {
  const filesPathsInThatFolder: string[] = await asyncUtils.fs.readdirAsync(
    bookAssetsAbsoluteFolderPath
  );
  const assets: ImportedBookAsset[] = [];
  const assetsTypesFilesRegexpsEntries = Object.entries(ASSETS_TYPES_FILES_REGEXPS);

  for (const filePath of filesPathsInThatFolder) {
    for (const [assetType, fileRegexp] of assetsTypesFilesRegexpsEntries) {
      if (filePath.match(fileRegexp)) {
        assets.push(
          await filePathToAsset(
            `${bookAssetsAbsoluteFolderPath}/${filePath}`,
            bookAssetsCommonFolderPath,
            assetType as BookAssetType
          )
        );
      }
    }
  }
  return assets;
}

async function filePathToAsset(
  absoluteFilePath: string,
  booksCommonFilePath: string,
  assetType: BookAssetType
): Promise<ImportedBookAsset> {
  const fileStats = await asyncUtils.fs.statAsync(absoluteFilePath);

  return {
    path: absoluteFilePath.replace(booksCommonFilePath, ""),
    type: assetType,
    size: fileStats.size,
  };
}
