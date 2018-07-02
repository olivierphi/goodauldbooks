import { Store } from "redux";
import { Book, BooksById, BookWithGenreStats, Lang } from "../domain/core";
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
    lang: Lang,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList> {
    const appState = this.appStateStore.getState();
    const booksIdsByAuthorCriteriaName = `${authorId}-${lang}`;
    const paginatedBooksIdsResultsFromCache = getPaginatedBooksIdsResultsFromCache(
      appState.booksIdsByAuthor,
      booksIdsByAuthorCriteriaName,
      pagination
    );

    if (paginatedBooksIdsResultsFromCache) {
      return Promise.resolve({
        pagination: getPaginationResponseDataFromPaginationRequest(
          pagination,
          appState.booksIdsByAuthor[booksIdsByAuthorCriteriaName].nbResultsTotal
        ),
        books: getBooksByIdsFromState(paginatedBooksIdsResultsFromCache, appState.booksById),
      });
    }

    return this.underlyingRepository.getBooksByAuthor(authorId, lang, pagination);
  }

  public getBooksByGenre(
    genre: string,
    lang: Lang,
    pagination: PaginationRequestData
  ): Promise<PaginatedBooksList> {
    const appState = this.appStateStore.getState();
    const booksIdsByGenreCriteriaName = `${genre}-${lang}`;
    const paginatedBooksIdsResultsFromCache = getPaginatedBooksIdsResultsFromCache(
      appState.booksIdsByGenre,
      booksIdsByGenreCriteriaName,
      pagination
    );

    if (paginatedBooksIdsResultsFromCache) {
      return Promise.resolve({
        pagination: getPaginationResponseDataFromPaginationRequest(
          pagination,
          appState.booksIdsByGenre[booksIdsByGenreCriteriaName].nbResultsTotal
        ),
        books: getBooksByIdsFromState(paginatedBooksIdsResultsFromCache, appState.booksById),
      });
    }

    return this.underlyingRepository.getBooksByGenre(genre, lang, pagination);
  }

  public getFeaturedBooks(lang: Lang): Promise<BooksById> {
    // TODO: store the featured books ids into the app state, so that we can cache the result
    return this.underlyingRepository.getFeaturedBooks(lang);
  }

  public quickSearch(pattern: string, lang: string): Promise<QuickSearchResult[]> {
    // TODO: cache queries into a private cache?
    return this.underlyingRepository.quickSearch(pattern, lang);
  }
}
