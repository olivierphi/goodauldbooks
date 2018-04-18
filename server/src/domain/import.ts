export enum Lang {
  EN = "en",
  FR = "fr",
}
export enum BookAssetType {
  COVER = "cover",
  EPUB = "epub",
  MOBI = "mobi",
  TXT = "txt",
}

export interface ImportedBook {
  gutenbergId: number;
  author: ImportedAuthor | null;
  title: string;
  lang: Lang;
  genres: string[];
  assets: ImportedBookAsset[];
}

export interface ImportedAuthor {
  gutenbergId: number;
  firstName: string;
  lastName: string;
  birthYear: number | null;
  deathYear: number | null;
  wikipediaUrl: string | null;
}

export interface ImportedBookAsset {
  type: BookAssetType;
  path: string;
  size: number;
}
