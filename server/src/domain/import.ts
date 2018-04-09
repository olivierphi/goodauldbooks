export enum Lang {
  EN = "en",
}

export interface ImportedBook {
  gutenbergId: number;
  author: Author;
  title: BookTitle;
  genres: Genre[];
}

export interface Author {
  gutenbergId: number;
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear: number | null;
  wikipediaUrl: string | null;
}

export interface BookTitle extends LocalisedContent {}

export interface Genre {
  name: LocalisedContent;
}

export type LocalisedContent = Map<Lang, string>;
