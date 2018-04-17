export enum Lang {
  EN = "en",
  FR = "fr",
}

export interface ImportedBook {
  gutenbergId: number;
  author: ImportedAuthor | null;
  title: string;
  lang: Lang;
  genres: string[];
  coverFilePath: string | null;
}

export interface ImportedAuthor {
  gutenbergId: number;
  firstName: string;
  lastName: string;
  birthYear: number | null;
  deathYear: number | null;
  wikipediaUrl: string | null;
}
