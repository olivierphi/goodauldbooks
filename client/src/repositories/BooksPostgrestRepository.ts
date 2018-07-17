import axios from "axios";
import {
  Book,
  BookFull,
  BooksById,
  BookWithGenreStats,
  GenreWithStats,
  Lang,
} from "../domain/core";
import {
  BooksRepository,
  PaginatedBooksList,
  PaginationRequestData,
  PaginationResponseData,
  QuickSearchResult,
} from "../domain/queries";
import * as ServerResponse from "./postgrest-server-responses";

const quickSearchResultsCache: { [cacheKey: string]: QuickSearchResult[] } = {};

/**
 * This module gets a bit messy, we'll probably refactor it at some point :-)
 */
export class BooksHttpRepository implements BooksRepository {
  public async getFeaturedBooks(lang: Lang): Promise<BooksById> {
    // TODO: store the books ids into the app state, so that we can cache the result
    // TODO: handle the language on server side, and pass it here
    const response = await axios.get("/rpc/featured_books");
    const featuredBooks: Book[] = response.data.map(mapBookFromServer);

    return Promise.resolve(getBooksByIdFromBooksArray(featuredBooks));
  }

  public async getBookById(bookId: string): Promise<BookWithGenreStats | null> {
    const response = await axios.get("/rpc/get_book_by_id", {
      params: {
        book_id: bookId,
      },
    });

    const bookDataFromServer: ServerResponse.BookWithGenreStats = response.data[0];
    const bookWithGenreStats = mapBookWithGenreStatsFromServer(bookDataFromServer);

    return Promise.resolve(bookWithGenreStats);
  }

  public async quickSearch(pattern: string, lang: Lang): Promise<QuickSearchResult[]> {
    const cacheKey: string = `${pattern}|${lang}`;
    const cacheForThisPatternAndLang = quickSearchResultsCache[cacheKey];
    if (cacheForThisPatternAndLang) {
      return Promise.resolve(cacheForThisPatternAndLang);
    }

    const response = await axios.get("/rpc/quick_autocompletion", {
      params: { pattern, lang },
    });

    const matchingBooks = response.data.map(mapQuickAutocompletionDataFromServer);
    quickSearchResultsCache[cacheKey] = matchingBooks;

    return Promise.resolve(matchingBooks);
  }

  public async getBooksByGenre(
    genre: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList> {
    const response = await axios.get("/rpc/get_books_by_genre", {
      params: {
        genre,
        lang,
        page: pagination.page,
        nb_per_page: pagination.nbPerPage,
      },
    });

    const booksWithPagination: ServerResponse.BooksDataWithPagination<ServerResponse.BookData> =
      response.data[0];
    const paginationData: PaginationResponseData = getPaginationResponseDataFromServerResponse(
      booksWithPagination.pagination
    );
    const booksForThisGenre = getBooksByIdFromBooksArray(
      (booksWithPagination.books || []).map(mapBookFromServer)
    );

    return Promise.resolve({
      books: booksForThisGenre,
      pagination: paginationData,
    });
  }

  public async getBooksByAuthor(
    authorId: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList> {
    const response = await axios.get("/rpc/get_books_by_author", {
      params: {
        author_id: authorId,
        lang,
        page: pagination.page,
        nb_per_page: pagination.nbPerPage,
      },
    });

    const booksWithPagination: ServerResponse.BooksDataWithPagination<ServerResponse.BookData> =
      response.data[0];
    const paginationData: PaginationResponseData = getPaginationResponseDataFromServerResponse(
      booksWithPagination.pagination
    );
    const booksForThisGenre = getBooksByIdFromBooksArray(
      (booksWithPagination.books || []).map(mapBookFromServer)
    );

    return Promise.resolve({
      books: booksForThisGenre,
      pagination: paginationData,
    });
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
      nbBooks: row.author_nb_books,
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
): QuickSearchResult {
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
    highlight: row.highlight,
  };
}

function getPaginationResponseDataFromServerResponse(
  responsePagination: ServerResponse.PaginationResponseData
): PaginationResponseData {
  return {
    page: responsePagination.page,
    nbPerPage: responsePagination.nb_per_page,
    totalCount: responsePagination.nb_results_total,
    totalCountForAllLangs: responsePagination.nb_results_total_for_all_langs,
  };
}
