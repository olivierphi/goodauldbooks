export interface BookToParse {
  pgBookId: number;
  rdfContent: string;
  dirFilesSizes: { [name: string]: number };
  hasIntro: boolean;
  hasCover: boolean;
  intro: string | null;
}

export enum BookAssetType {
  COVER = "cover",
  EPUB = "epub",
  MOBI = "mobi",
  TXT = "txt",
}

export interface ImportedBookAsset {
  type: BookAssetType;
  path: string;
  size: number;
}
