import { Book, BooksById } from "./core";

export interface BooksRepository {
  getFeaturedBooks(): Promise<BooksById>;
  getBookById(bookId: string): Promise<Book | null>;
  quickSearch(pattern: string): Promise<QuickSearchResult[]>;
}

export interface QuickSearchResult {
  readonly resultType: "book" | "author";
  readonly book: QuickSearchResultBook | null;
  readonly author: QuickSearchResultAuthor;
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

export interface PaginationRequestData {
  page: number;
  nbPerPage: number;
}

export interface PaginationResponseData {
  currentPage: number;
  nbPerPage: number;
  nbPages: number;
  nbResults: number;
}
