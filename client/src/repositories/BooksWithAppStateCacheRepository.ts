import { Store } from "redux";
import { Book, BooksById, BooksIdsByGenre, BookWithGenreStats } from "../domain/core";
import {
  BooksRepository,
  PaginatedBooksList,
  PaginationRequestData,
  QuickSearchResult,
} from "../domain/queries";
import { AppState } from "../store";
import {
  appStateHasGenresWithStats,
  getBooksByIdsFromState,
  getFullBookDataFromState,
  getGenresWithStatsFromState,
} from "../utils/app-state-utils";
import {
  getPaginatedBooksIdsResultsFromCache,
  getPaginationResponseDataFromPaginationRequest,
} from "../utils/pagination-utils";

export class BooksWithAppStateCacheRepository implements BooksRepository {
  constructor(
    private appStateStore: Store<AppState>,
    private underlyingRepository: BooksRepository
  ) {}

  public getBookById(bookId: string): Promise<BookWithGenreStats | null> {
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

    return this.underlyingRepository.getBookById(bookId);
  }

  public getBookIntro(bookId: string): Promise<string | null> {
    // TODO: store the featured books ids into the app state or a local cache, so that we can cache the result
    return this.underlyingRepository.getBookIntro(bookId);
  }

  public getBooksByAuthor(
    authorId: string,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList> {
    const appState = this.appStateStore.getState();
    const paginatedBooksIdsResultsFromCache = getPaginatedBooksIdsResultsFromCache(
      appState.booksIdsByAuthor,
      authorId,
      pagination
    );

    if (paginatedBooksIdsResultsFromCache) {
      return Promise.resolve({
        pagination: getPaginationResponseDataFromPaginationRequest(
          pagination,
          appState.booksIdsByAuthor.nbResultsTotal
        ),
        books: getBooksByIdsFromState(paginatedBooksIdsResultsFromCache, appState.booksById),
      });
    }

    return this.underlyingRepository.getBooksByAuthor(authorId, pagination);
  }

  public getBooksByGenre(
    genre: string,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList> {
    const appState = this.appStateStore.getState();
    const paginatedBooksIdsResultsFromCache = getPaginatedBooksIdsResultsFromCache(
      appState.booksIdsByGenre,
      genre,
      pagination
    );

    if (paginatedBooksIdsResultsFromCache) {
      return Promise.resolve({
        pagination: getPaginationResponseDataFromPaginationRequest(
          pagination,
          appState.booksIdsByGenre.nbResultsTotal
        ),
        books: getBooksByIdsFromState(paginatedBooksIdsResultsFromCache, appState.booksById),
      });
    }

    return this.underlyingRepository.getBooksByGenre(genre, pagination);
  }

  public getFeaturedBooks(): Promise<BooksById> {
    // TODO: store the featured books ids into the app state, so that we can cache the result
    return this.underlyingRepository.getFeaturedBooks();
  }

  public quickSearch(pattern: string, lang: string): Promise<QuickSearchResult[]> {
    // TODO: cache queries into a private cache?
    return this.underlyingRepository.quickSearch(pattern, lang);
  }
}
