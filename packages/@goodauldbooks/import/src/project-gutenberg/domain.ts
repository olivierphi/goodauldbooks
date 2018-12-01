export const PROVIDER_CODE = "pg";

export interface BookToParse {
  pgBookId: number;
  rdfContent: string;
  dirFilesSizes: { [name: string]: number };
  hasIntro: boolean;
  hasCover: boolean;
  intro: string | null;
}
