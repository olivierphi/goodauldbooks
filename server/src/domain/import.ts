export enum Lang {
  EN = "en",
  FR = "fr",
}

export interface ImportedBook {
  gutenbergId: number;
  author: ImportedAuthor;
  title: string;
  lang: Lang;
  genres: string[];
}

export interface ImportedAuthor {
  gutenbergId: number;
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear: number | null;
  wikipediaUrl: string | null;
}
