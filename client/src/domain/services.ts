import * as EventEmitter from "eventemitter3";
import { History } from "history";
import { i18n as i18next } from "i18next";
import { Store } from "redux";
import { AppState } from "../store";
import { BooksLanguagesRepository, BooksRepository } from "./queries";

export interface ServicesLocator {
  readonly appStateStore: Store<AppState>;
  readonly booksRepository: BooksRepository;
  readonly booksLangsRepository: BooksLanguagesRepository;
  readonly i18n: i18next;
  readonly messageBus: EventEmitter;
  readonly history: History;
  boot(): Promise<boolean>;
}
