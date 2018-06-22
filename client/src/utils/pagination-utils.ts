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
  for (let i = offset; i < upperLimit; i++) {
    if (!appStateList.results[criteriaName][i]) {
      return null;
    }
  }

  return appStateList.results[criteriaName].slice(offset, upperLimit);
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
