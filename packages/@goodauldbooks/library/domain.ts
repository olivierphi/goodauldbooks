export const LANG_ALL = "_all_";

export enum BookAssetType {
  COVER = "cover",
  EPUB = "epub",
  MOBI = "mobi",
  TXT = "txt",
}

export interface BookAsset {
  type: BookAssetType;
  size: number;
}

export interface Author {
  provider: string;
  id: string;
  firstName: string | null;
  lastName: string | null;
  birthYear: number | null;
  deathYear: number | null;
}

export interface Book {
  provider: string;
  id: string;
  title: string;
  lang: string;
  genres: string[];
  assets: BookAsset[];
  authors: Author[];
}
