import { Lang } from "./core";

export enum ACTIONS {
  GO_TO_BOOK_PAGE = "GO_TO_BOOK_PAGE",
  GO_TO_AUTHOR_PAGE = "GO_TO_AUTHOR_PAGE",
  PUSH_URL = "PUSH_URL",
  SET_BREADCRUMB = "SET_BREADCRUMB",
}

export enum EVENTS {
  URL_CHANGED = "URL_CHANGED",
  BOOKS_LANG_CHANGED = "BOOKS_LANG_CHANGED",
  BOOK_DATA_FETCHED = "BOOK_DATA_FETCHED",
  BOOK_INTRO_FETCHED = "BOOK_INTRO_FETCHED",
}

export interface GoToBookPageAction {
  readonly bookId: string;
  readonly bookLang: Lang;
  readonly bookSlug: string;
  readonly authorSlug: string;
}

export interface GoToAuthorPageAction {
  readonly authorId: string;
  readonly authorSlug: string;
}
