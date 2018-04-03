import { Book, BooksById } from "./core";

export interface BooksRepository {
  getBooks(pagination: PaginationRequestData): Promise<BooksById>;
  getBookById(id: string): Promise<Book | null>;
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
