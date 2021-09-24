export type BookToParse = {
    pgBookId: number;
    rdfContent: string;
    dirFilesSizes: { [name: string]: number };
    hasIntro: boolean;
    hasCover: boolean;
    intro: string | null;
};

export enum EmittedEvents {
    IMPORT_ERROR = "book_import:error",
}
