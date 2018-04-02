import { Book, BooksById, Uuid } from "../domain";

export interface BooksRepository {
  getBooks(pagination: PaginationRequestData): Promise<BooksById>;
  getBookByUuid(uuid: Uuid): Promise<Book | null>;
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
