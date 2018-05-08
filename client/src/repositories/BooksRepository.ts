import axios from "axios";
import { Store } from "redux";
import { Book, BooksById } from "../domain/core";
import * as queriesDomain from "../domain/queries";
import { AppState } from "../store";

/**
 * This module gets a bit messy, we'll probably refactor it at some point :-)
 */
export class BooksRepository implements queriesDomain.BooksRepository {
  constructor(private appStateStore: Store<AppState>) {}

  public async getFeaturedBooks(): Promise<BooksById> {
    const response = await axios.get("/rpc/featured_books");
    const featuredBooks: Book[] = response.data.map(
      (pinnedBook: ServerResponse.PinnedBookData): Book => {
        return serverResponseBookDataToSlug(pinnedBook);
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
    const book: Book = serverResponseBookDataToSlug(bookDataFromServer);

    return Promise.resolve(book);
  }

  public async quickSearch(pattern: string): Promise<queriesDomain.QuickSearchResult[]> {
    const response = await axios.get("/rpc/quick_autocompletion", {
      params: { pattern },
    });

    const matchingBooks = response.data.map(
      (row: ServerResponse.QuickAutocompletionData): queriesDomain.QuickSearchResult => {
        return serverResponseQuickAutocompletionDataToQuickSearchResult(row);
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

function serverResponseBookDataToSlug(row: ServerResponse.BookData): Book {
  return {
    id: row.book_id,
    lang: row.book_lang,
    title: row.book_title,
    subtitle: row.book_subtitle,
    slug: row.book_slug,
    author: {
      id: row.author_id,
      firstName: row.author_first_name,
      lastName: row.author_last_name,
      slug: row.author_slug,
    },
    genres: row.genres,
    coverUrl: row.book_cover_path,
  };
}

function serverResponseQuickAutocompletionDataToQuickSearchResult(
  row: ServerResponse.QuickAutocompletionData
): queriesDomain.QuickSearchResult {
  const rowType = row.type;
  return {
    resultType: rowType,
    book:
      "book" === rowType
        ? {
            id: row.book_id as string,
            title: row.book_title as string,
            lang: row.book_lang as string,
            slug: row.book_slug as string,
          }
        : null,
    author: {
      id: row.author_id,
      firstName: row.author_first_name,
      lastName: row.author_last_name,
      slug: row.author_slug,
      nbBooks: row.author_nb_books,
    },
  };
}

namespace ServerResponse {
  export interface BookData {
    book_id: string;
    book_title: string;
    book_subtitle: string | null;
    book_cover_path: string | null;
    book_lang: string;
    book_slug: string;
    author_id: string;
    author_first_name: string | null;
    author_last_name: string | null;
    author_slug: string;
    genres: string[];
  }

  export interface PinnedBookData extends BookData {}

  export interface QuickAutocompletionData {
    type: "book" | "author";
    book_id: string | null;
    book_title: string | null;
    book_lang: string;
    book_slug: string;
    author_id: string;
    author_first_name: string;
    author_last_name: string;
    author_slug: string;
    author_nb_books: number;
  }
}
