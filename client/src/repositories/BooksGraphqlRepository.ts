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
import * as ServerResponse from "./graphql-server-responses";

const quickSearchResultsCache: { [cacheKey: string]: QuickSearchResult[] } = {};

/**
 * This module gets a bit messy, we'll probably refactor it at some point :-)
 *
 * N.B.: I haven't used a specific GraphQL client library like Apollo, because I always send the same static queries and
 * I don't need to add the size of such a client lib to my JS.
 */
export class BooksGraphqlRepository implements BooksRepository {
  public async getFeaturedBooks(lang: Lang): Promise<BooksById> {
    // TODO: store the books ids into the app state, so that we can cache the result
    // TODO: handle the language on server side, and pass it here
    const graphqlQuery = `
query {

  featuredBooks {
    bookId
    lang
    title
    subtitle
    slug
    coverPath
    genres

    author {
      authorId
      firstName
      lastName
      birthYear
      deathYear
      slug
      nbBooks
    }
  }

}
      `;
    const response = await this.requestGraphql(graphqlQuery, null);
    const featuredBooks: Book[] = response.data.data.featuredBooks.map(mapBookFromServer);

    return Promise.resolve(getBooksByIdFromBooksArray(featuredBooks));
  }

  public async getBookById(bookId: string): Promise<BookWithGenreStats | null> {
    const graphqlQuery = `
query bookById($bookId: BookId!) {

  bookWithGenresStats(bookId: $bookId) {
    book {
      bookId
      lang
      title
      subtitle
      slug
      coverPath
      genres
      epubSize
      mobiSize

      author {
        authorId
        firstName
        lastName
        birthYear
        deathYear
        slug
        nbBooks
      }
    }

    genresStats {
      title
      nbBooks

      nbBooksByLang {
        lang
        nbBooks
      }
    }
  }

}

`;
    const response = await this.requestGraphql(graphqlQuery, { bookId });
    const bookDataFromServer: ServerResponse.BookWithGenreStats =
      response.data.data.bookWithGenresStats;
    const bookWithGenreStats = mapBookWithGenreStatsFromServer(bookDataFromServer);

    return Promise.resolve(bookWithGenreStats);
  }

  public async quickSearch(pattern: string, lang: Lang): Promise<QuickSearchResult[]> {
    const cacheKey: string = `${pattern}|${lang}`;
    const cacheForThisPatternAndLang = quickSearchResultsCache[cacheKey];
    if (cacheForThisPatternAndLang) {
      return Promise.resolve(cacheForThisPatternAndLang);
    }

    const graphqlQuery = `
query quickSearch($pattern: String!, $lang: String) {

  quickSearch(search: $pattern, lang: $lang) {
    type
    bookId
    bookLang
    bookTitle
    bookSlug
    authorId
    authorFirstName
    authorLastName
    authorSlug
    authorNbBooks
    highlight
  }

}
    `;
    const response = await this.requestGraphql(graphqlQuery, { pattern, lang });
    const matchingBooks = response.data.data.quickSearch.map(mapQuickSearchDataFromServer);
    quickSearchResultsCache[cacheKey] = matchingBooks;

    return Promise.resolve(matchingBooks);
  }

  public async getBooksByGenre(
    genre: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList> {
    const graphqlQuery = `
query booksByGenre($genre: String!, $lang: String, $page: Int, $nbPerPage: Int) {

  booksByGenre(genre: $genre, lang: $lang, page: $page, nbPerPage: $nbPerPage) {

    books {
      bookId
      lang
      title
      subtitle
      slug
      coverPath
      genres

      author {
        authorId
        firstName
        lastName
        birthYear
        deathYear
        slug
        nbBooks
      }
    }

    meta {
      page
      nbPerPage
      totalCount
      totalCountForAllLangs
    }

  }

}
    `;
    const response = await this.requestGraphql(graphqlQuery, {
      genre,
      lang,
      page: pagination.page,
      nbPerPage: pagination.nbPerPage,
    });

    const booksWithPagination: ServerResponse.BooksDataWithPagination<ServerResponse.BookData> =
      response.data.data.booksByGenre;
    const paginationData: PaginationResponseData = getPaginationResponseDataFromServerResponse(
      booksWithPagination.meta
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
      response.data.data.booksByAuthor;
    const paginationData: PaginationResponseData = getPaginationResponseDataFromServerResponse(
      booksWithPagination.meta
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
    const graphqlQuery = `
query bookIntro($bookId: BookId!) {

  book(bookId: $bookId) {
    intro
  }

}


`;
    const response = await this.requestGraphql(graphqlQuery, { bookId });
    const intro: string | null = response.data.data.book.intro;

    return Promise.resolve(intro || null);
  }

  private requestGraphql(query: string, variables: object | null = null) {
    return axios({
      url: "/",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ query, variables }),
    });
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
    id: row.bookId,
    lang: row.lang,
    title: row.title,
    subtitle: row.subtitle,
    slug: row.slug,
    author: {
      id: row.author.authorId,
      firstName: row.author.firstName,
      lastName: row.author.lastName,
      birthYear: row.author.birthYear,
      deathYear: row.author.deathYear,
      slug: row.author.slug,
      nbBooks: row.author.nbBooks,
    },
    coverUrl: row.coverPath,
    genres: row.genres,
  };
}

function mapBookFullFromServer(row: ServerResponse.BookFullData): BookFull {
  return {
    ...mapBookFromServer(row),
    epubSize: row.epubSize,
    mobiSize: row.mobiSize,
  };
}

function mapBookWithGenreStatsFromServer(
  row: ServerResponse.BookWithGenreStats
): BookWithGenreStats {
  return {
    book: mapBookFullFromServer(row.book),
    genresWithStats: row.genresStats.map(mapGenreWithStatsFromServer),
  };
}

function mapGenreWithStatsFromServer(row: ServerResponse.GenreWithStats): GenreWithStats {
  const nbBooksByLang: { [lang: string]: number } = {};
  for (const nbBooksForLang of row.nbBooksByLang) {
    nbBooksByLang[nbBooksForLang.lang] = nbBooksForLang.nbBooks;
  }

  return {
    title: row.title,
    nbBooks: row.nbBooks,
    nbBooksByLang,
  };
}

function mapQuickSearchDataFromServer(row: ServerResponse.QuickSearchData): QuickSearchResult {
  const rowType = row.type;
  return {
    resultType: rowType,
    book:
      "book" === rowType
        ? {
            id: row.bookId as string,
            title: row.bookTitle as string,
            lang: row.bookLang as string,
            slug: row.bookSlug as string,
          }
        : null,
    author: {
      id: row.authorId,
      firstName: row.authorFirstName,
      lastName: row.authorLastName,
      slug: row.authorSlug,
      nbBooks: row.authorNbBooks,
    },
    highlight: row.highlight,
  };
}

function getPaginationResponseDataFromServerResponse(
  responsePagination: ServerResponse.PaginationMetaData
): PaginationResponseData {
  return {
    page: responsePagination.page,
    nbPerPage: responsePagination.nbPerPage,
    totalCount: responsePagination.totalCount,
    totalCountForAllLangs: responsePagination.totalCountForAllLangs,
  };
}
