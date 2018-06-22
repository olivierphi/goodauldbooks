import { PaginatedBooksIdsList } from "../domain/core";
import { PaginationRequestData, PaginationResponseData } from "../domain/queries";

export function getPaginatedBooksIdsResultsFromCache(
  appStateList: PaginatedBooksIdsList,
  criteriaName: string,
  pagination: PaginationRequestData
): string[] | null {
  if (!appStateList.results[criteriaName]) {
    return null;
  }
  const [offset, limit] = [(pagination.page - 1) * pagination.nbPerPage, pagination.nbPerPage];
  const upperLimit = Math.min(offset + limit, appStateList.nbResultsTotal);
  const results: string[] = [];
  for (let i = offset; i < upperLimit; i++) {
    const bookId = appStateList.results[criteriaName][i];
    if (!bookId) {
      return null;
    }
    results.push(bookId);
  }

  return results;
}

export function getPaginationResponseDataFromPaginationRequest(
  paginationRequest: PaginationRequestData,
  nbResultsTotal: number
): PaginationResponseData {
  return {
    page: paginationRequest.page,
    nbPerPage: paginationRequest.nbPerPage,
    nbResultsTotal,
  };
}
