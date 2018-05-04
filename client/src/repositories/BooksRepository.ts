import axios from "axios";
import { Store } from "redux";
import * as coreDomain from "../domain/core";
import * as queriesDomain from "../domain/queries";
import { AppState } from "../store";

export class BooksRepository implements queriesDomain.BooksRepository {
  constructor(private appStateStore: Store<AppState>) {}

  public async getPinnedBooks(
    pagination: queriesDomain.PaginationRequestData
  ): Promise<coreDomain.BooksById> {
    const response = await axios.get("/rpc/pinned_books");
    const pinnedBooks: coreDomain.Book[] = response.data.map(
      (pinnedBook: ServerResponse.PinnedBook): coreDomain.Book => {
        return {
          id: pinnedBook.book_id,
          title: pinnedBook.book_title,
          subtitle: pinnedBook.book_subtitle,
          author: {
            firstName: pinnedBook.author_firstname,
            lastName: pinnedBook.author_lastname,
          },
          genres: pinnedBook.genres,
          cover: pinnedBook.cover_path,
        };
      }
    );

    return Promise.resolve(getBooksByIdFromBooksArray(pinnedBooks));
  }

  public async getBookById(bookId: string): Promise<coreDomain.Book | null> {
    const appStateStoreBooksById = this.appStateStore.getState().booksById;
    if (appStateStoreBooksById[bookId]) {
      return Promise.resolve(appStateStoreBooksById[bookId]);
    }

    const response = await axios.get("/rpc/get_book_by_id", {
      params: {
        id: bookId,
      },
    });

    const bookDataFromServer: ServerResponse.Book = response.data[0];
    const book: coreDomain.Book = {
      id: bookDataFromServer.book_id,
      title: bookDataFromServer.book_title,
      subtitle: bookDataFromServer.book_subtitle,
      author: {
        firstName: bookDataFromServer.author_firstname,
        lastName: bookDataFromServer.author_lastname,
      },
      genres: bookDataFromServer.genres,
      cover: bookDataFromServer.cover_path,
    };

    return Promise.resolve(book);
  }
}

function getBooksByIdFromBooksArray(books: coreDomain.Book[]): coreDomain.BooksById {
  const booksById: coreDomain.BooksById = {};
  for (const book of books) {
    booksById[book.id] = book;
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

namespace ServerResponse {
  export interface Book {
    book_id: string;
    book_title: string;
    book_subtitle: string | null;
    cover_path: string | null;
    lang: string;
    author_firstname: string | null;
    author_lastname: string | null;
    genres: string[];
  }

  export interface PinnedBook extends Book {}
}
