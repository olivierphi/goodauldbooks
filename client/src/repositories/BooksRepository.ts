import * as coreDomain from "../domain/core";
import * as queriesDomain from "../domain/queries";
import { books as booksFixtures } from "./fixtures";

const FAKE_ASYNC_LATENCY = 1500;

export class BooksRepository implements queriesDomain.BooksRepository {
  private booksByIdCache: coreDomain.BooksById = new Map();

  public getBooks(
    pagination: queriesDomain.PaginationRequestData
  ): Promise<coreDomain.BooksById> {
    return new Promise((resolve, reject) => {
      const booksById = getBooksByIdFromBooksArray(booksFixtures);
      setTimeout(resolve.bind(null, booksById), FAKE_ASYNC_LATENCY);
    });
  }

  public getBookById(bookId: string): Promise<coreDomain.Book | null> {
    if (this.booksByIdCache.has(bookId)) {
      return Promise.resolve(this.booksByIdCache.get(
        bookId
      ) as coreDomain.Book);
    }

    return new Promise((resolve, reject) => {
      const book = getBookByIdFromBooksArray(booksFixtures, bookId);
      if (book) {
        this.booksByIdCache.set(bookId, book);
      }
      setTimeout(resolve.bind(null, book), FAKE_ASYNC_LATENCY);
    });
  }
}

function getBooksByIdFromBooksArray(
  books: coreDomain.Book[]
): coreDomain.BooksById {
  const booksById: coreDomain.BooksById = new Map();
  for (const book of books) {
    booksById.set(book.id, book);
  }

  return booksById;
}

function getBookByIdFromBooksArray(
  books: coreDomain.Book[],
  bookId: string
): coreDomain.Book | null {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }

  return null;
}
