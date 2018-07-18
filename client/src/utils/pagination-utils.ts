import { BookId, PaginatedBooksIdsListByCriteria } from "../domain/core";
import { PaginationRequestData, PaginationResponseData } from "../domain/queries";

export function getPaginatedBooksIdsResultsFromCache(
  appStateList: PaginatedBooksIdsListByCriteria,
  criteriaName: string,
  pagination: PaginationRequestData
): string[] | null {
  if (!appStateList[criteriaName]) {
    return null;
  }
  const [offset, limit] = [(pagination.page - 1) * pagination.nbPerPage, pagination.nbPerPage];
  const upperLimit = Math.min(offset + limit, appStateList[criteriaName].totalCount);
  const results: string[] = [];
  for (let i = offset; i < upperLimit; i++) {
    const bookId: BookId = appStateList[criteriaName].results[i];
    if (!bookId) {
      return null;
    }
    results.push(bookId);
  }

  return results;
}

export function getPaginationResponseDataFromPaginationRequest(
  paginationRequest: PaginationRequestData,
  totalCount: number,
  totalCountForAllLangs: number
): PaginationResponseData {
  return {
    page: paginationRequest.page,
    nbPerPage: paginationRequest.nbPerPage,
    totalCount,
    totalCountForAllLangs,
  };
}
