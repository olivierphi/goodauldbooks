import axios from "axios";
import { Store } from "redux";
import { Book, BooksById } from "../domain/core";
import * as queriesDomain from "../domain/queries";
import { AppState } from "../store";

export class BooksRepository implements queriesDomain.BooksRepository {
  constructor(private appStateStore: Store<AppState>) {}

  public async getFeaturedBooks(): Promise<BooksById> {
    const response = await axios.get("/rpc/featured_books");
    const featuredBooks: Book[] = response.data.map(
      (pinnedBook: ServerResponse.PinnedBookData): Book => {
        return {
          id: pinnedBook.book_id,
          lang: pinnedBook.book_lang,
          title: pinnedBook.book_title,
          subtitle: pinnedBook.book_subtitle,
          author: {
            id: pinnedBook.author_id,
            firstName: pinnedBook.author_first_name,
            lastName: pinnedBook.author_last_name,
          },
          genres: pinnedBook.genres,
          coverUrl: pinnedBook.book_cover_path,
        };
      }
    );

    return Promise.resolve(getBooksByIdFromBooksArray(featuredBooks));
  }

  public async getBookById(bookId: string): Promise<Book | null> {
    const appStateStoreBooksById = this.appStateStore.getState().booksById;
    if (appStateStoreBooksById[bookId]) {
      return Promise.resolve(appStateStoreBooksById[bookId]);
    }

    const response = await axios.get("/rpc/get_book_by_id", {
      params: {
        book_id: bookId,
      },
    });

    const bookDataFromServer: ServerResponse.BookData = response.data[0];
    const book: Book = {
      id: bookDataFromServer.book_id,
      lang: bookDataFromServer.book_lang,
      title: bookDataFromServer.book_title,
      subtitle: bookDataFromServer.book_subtitle,
      author: {
        id: bookDataFromServer.author_id,
        firstName: bookDataFromServer.author_first_name,
        lastName: bookDataFromServer.author_last_name,
      },
      genres: bookDataFromServer.genres,
      coverUrl: bookDataFromServer.book_cover_path,
    };

    return Promise.resolve(book);
  }

  public async quickSearch(pattern: string): Promise<queriesDomain.QuickSearchResult[]> {
    const response = await axios.get("/rpc/quick_autocompletion", {
      params: { pattern },
    });

    const matchingBooks = response.data.map(
      (row: ServerResponse.QuickAutocompletionData): queriesDomain.QuickSearchResult => {
        const rowType = row.type;
        return {
          resultType: rowType,
          book:
            "book" === rowType
              ? {
                  id: row.book_id || "",
                  title: row.book_title || "",
                  lang: row.book_lang || "",
                }
              : null,
          author: {
            id: row.author_id,
            firstName: row.author_first_name,
            lastName: row.author_last_name,
            nbBooks: row.author_nb_books,
          },
        };
      }
    );

    return Promise.resolve(matchingBooks);
  }
}

function getBooksByIdFromBooksArray(books: Book[]): BooksById {
  const booksById: BooksById = {};
  for (const book of books) {
    booksById[book.id] = book;
  }

  return booksById;
}

function getBookByIdFromBooksArray(books: Book[], bookId: string): Book | null {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }

  return null;
}

namespace ServerResponse {
  export interface BookData {
    book_id: string;
    book_title: string;
    book_subtitle: string | null;
    book_cover_path: string | null;
    book_lang: string;
    author_id: string;
    author_first_name: string | null;
    author_last_name: string | null;
    genres: string[];
  }

  export interface PinnedBookData extends BookData {}

  export interface QuickAutocompletionData {
    type: "book" | "author";
    book_id: string | null;
    book_title: string | null;
    book_lang: string;
    author_id: string;
    author_first_name: string;
    author_last_name: string;
    author_nb_books: number;
  }
}
