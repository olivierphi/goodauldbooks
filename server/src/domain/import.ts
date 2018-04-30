
export enum BookAssetType {
  COVER = "cover",
  EPUB = "epub",
  MOBI = "mobi",
  TXT = "txt",
}

export interface ImportedBook {
  folder: string;
  rdfFilePath: string;
}

export interface ImportedBookAsset {
  type: BookAssetType;
  path: string;
  size: number;
}
