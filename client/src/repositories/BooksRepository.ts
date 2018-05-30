import axios from "axios";
import { Store } from "redux";
import { Book, BookFull, BooksById, BookWithGenreStats, GenreWithStats } from "../domain/core";
import * as queriesDomain from "../domain/queries";
import { AppState } from "../store";
import {
  appStateHasGenresWithStats,
  getBooksByIdsFromState,
  getFullBookDataFromState,
  getGenresWithStatsFromState,
} from "../utils/app-state-utils";
import * as ServerResponse from "./server-responses";

/**
 * This module gets a bit messy, we'll probably refactor it at some point :-)
 */
export class BooksRepository implements queriesDomain.BooksRepository {
  constructor(private appStateStore: Store<AppState>) {}

  public async getFeaturedBooks(): Promise<BooksById> {
    // TODO: store the books ids into the app state, so that we can cache the result
    const response = await axios.get("/rpc/featured_books");
    const featuredBooks: Book[] = response.data.map(mapBookFromServer);

    return Promise.resolve(getBooksByIdFromBooksArray(featuredBooks));
  }

  public async getBookById(bookId: string): Promise<BookWithGenreStats | null> {
    const appState = this.appStateStore.getState();
    const appStateStoreBooksById = appState.booksById;
    const previouslyFetchedBookData: Book | null = appStateStoreBooksById[bookId];
    if (
      previouslyFetchedBookData &&
      appStateHasGenresWithStats(previouslyFetchedBookData.genres, appState.genresWithStats) &&
      appState.booksAssetsSize[bookId]
    ) {
      return Promise.resolve({
        book: getFullBookDataFromState(bookId, appStateStoreBooksById, appState.booksAssetsSize),
        genresWithStats: getGenresWithStatsFromState(
          previouslyFetchedBookData.genres,
          appState.genresWithStats
        ),
      });
    }

    const response = await axios.get("/rpc/get_book_by_id", {
      params: {
        book_id: bookId,
      },
    });

    const bookDataFromServer: ServerResponse.BookWithGenreStats = response.data[0];
    const bookWithGenreStats = mapBookWithGenreStatsFromServer(bookDataFromServer);

    return Promise.resolve(bookWithGenreStats);
  }

  public async quickSearch(pattern: string): Promise<queriesDomain.QuickSearchResult[]> {
    const response = await axios.get("/rpc/quick_autocompletion", {
      params: { pattern },
    });

    const matchingBooks = response.data.map(mapQuickAutocompletionDataFromServer);

    return Promise.resolve(matchingBooks);
  }

  public async getBooksByGenre(genre: string): Promise<BooksById> {
    const appState = this.appStateStore.getState();
    if (appState.booksIdsByGenre[genre]) {
      return Promise.resolve(
        getBooksByIdsFromState(appState.booksIdsByGenre[genre], appState.booksById)
      );
    }

    const response = await axios.get("/rpc/get_books_by_genre", {
      params: { genre },
    });

    const booksForThisGenre = getBooksByIdFromBooksArray(response.data.map(mapBookFromServer));

    return Promise.resolve(booksForThisGenre);
  }

  public async getBookIntro(bookId: string): Promise<string | null> {
    const response = await axios.get("/rpc/get_book_intro", {
      params: {
        book_id: bookId,
      },
    });

    return Promise.resolve(response.data[0].intro || null);
  }
}

function getBooksByIdFromBooksArray(books: Book[]): BooksById {
  const booksById: BooksById = {};
  for (const book of books) {
    booksById[book.id] = book;
  }

  return booksById;
}

function mapBookFromServer(row: ServerResponse.BookData): Book {
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
      birthYear: row.author_birth_year,
      deathYear: row.author_death_year,
      slug: row.author_slug,
    },
    coverUrl: row.book_cover_path,
    genres: row.genres,
  };
}

function mapBookFullFromServer(row: ServerResponse.BookFullData): BookFull {
  return {
    ...mapBookFromServer(row),
    epubSize: row.book_epub_size,
    mobiSize: row.book_mobi_size,
  };
}

function mapBookWithGenreStatsFromServer(
  row: ServerResponse.BookWithGenreStats
): BookWithGenreStats {
  return {
    book: mapBookFullFromServer(row.book),
    genresWithStats: row.genres.map(mapGenreWithStatsFromServer),
  };
}

function mapGenreWithStatsFromServer(row: ServerResponse.GenreWithStats): GenreWithStats {
  return {
    title: row.title,
    nbBooks: row.nb_books,
    nbBooksByLang: row.nb_books_by_lang,
  };
}

function mapQuickAutocompletionDataFromServer(
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
