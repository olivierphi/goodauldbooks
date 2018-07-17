import { BooksById, BookWithGenreStats, Lang } from "./core";

export interface BooksRepository {
  getFeaturedBooks(lang: Lang): Promise<BooksById>;
  getBookById(bookId: string): Promise<BookWithGenreStats | null>;
  quickSearch(pattern: string, lang: Lang): Promise<QuickSearchResult[]>;
  getBooksByGenre(
    genre: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList>;
  getBooksByAuthor(
    authorId: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList>;
  getBookIntro(bookId: string): Promise<string | null>;
}

export interface BooksLanguagesRepository {
  getAllLangs(): BookLangData[];
}

export interface QuickSearchResult {
  readonly resultType: "book" | "author";
  readonly book: QuickSearchResultBook | null;
  readonly author: QuickSearchResultAuthor;
  readonly highlight: number;
}
export interface QuickSearchResultBook {
  readonly id: string;
  readonly title: string;
  readonly lang: string;
  readonly slug: string;
}
export interface QuickSearchResultAuthor {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly nbBooks: number;
  readonly slug: string;
}

export interface PaginatedBooksList {
  books: BooksById;
  pagination: PaginationResponseData;
}
export interface PaginationRequestData {
  nbPerPage: number;
  page: number;
}

export interface PaginationResponseData {
  nbPerPage: number;
  page: number;
  totalCount: number;
  totalCountForAllLangs: number;
}

export interface BookLangData {
  lang: string;
  nbBooks: number;
}
