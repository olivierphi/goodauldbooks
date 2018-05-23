import {
  BookFull,
  BooksAssetsSizeById,
  BooksById,
  GenreWithStats,
  GenreWithStatsByName,
} from "../domain/core";

export function getBooksByIdsFromState(bookIds: string[], appStateBooks: BooksById): BooksById {
  const result: BooksById = {};
  for (const bookId of bookIds) {
    if (!appStateBooks[bookId]) {
      throw new Error(`Missing "appState.booksById" for book "${bookId}"`);
    }
    result[bookId] = appStateBooks[bookId];
  }
  return result;
}

export function appStateHasGenresWithStats(
  genresNames: string[],
  appStateGenres: GenreWithStatsByName
): boolean {
  for (const genre of genresNames) {
    if (!appStateGenres[genre]) {
      return false;
    }
  }
  return true;
}

export function getGenresWithStatsFromState(
  genresNames: string[],
  appStateGenres: GenreWithStatsByName
): GenreWithStats[] {
  const genreWithStats = [];
  for (const genre of genresNames) {
    if (!appStateGenres[genre]) {
      throw new Error(`Missing "appState.genresWithStats" for genre "${genre}"`);
    }
    genreWithStats.push(appStateGenres[genre]);
  }
  return genreWithStats;
}

export function getGenresByNameWithStatsFromState(
  genresNames: string[],
  appStateGenres: GenreWithStatsByName
): GenreWithStatsByName {
  const result: GenreWithStatsByName = {};
  for (const genre of genresNames) {
    if (!appStateGenres[genre]) {
      throw new Error(`Missing "appState.genresWithStats" for genre "${genre}"`);
    }
    result[genre] = appStateGenres[genre];
  }
  return result;
}

export function getFullBookDataFromState(
  bookId: string,
  appStateBooks: BooksById,
  appStateBooksAssetsSize: BooksAssetsSizeById
): BookFull {
  if (!appStateBooks[bookId]) {
    throw new Error(`Missing "appState.booksById" for book "${bookId}"`);
  }
  if (!appStateBooksAssetsSize[bookId]) {
    throw new Error(`Missing "appState.booksAssetsSize" for book "${bookId}"`);
  }

  return {
    ...appStateBooks[bookId],
    epubSize: appStateBooksAssetsSize[bookId].epub,
    mobiSize: appStateBooksAssetsSize[bookId].mobi,
  };
}
