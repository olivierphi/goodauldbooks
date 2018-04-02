import * as repositoriesDomain from "./repositories/api";
import { BooksRepository } from "./repositories/BooksRepository";

enum ServicesIds {
  BOOKS_REPOSITORY,
}

interface ServicesRegistry {
  [serviceId: number]: any;
}

class ServicesContainer {
  private servicesCache: ServicesRegistry = {};

  get booksRepository(): repositoriesDomain.BooksRepository {
    if (this.servicesCache[ServicesIds.BOOKS_REPOSITORY]) {
      return this.servicesCache[ServicesIds.BOOKS_REPOSITORY];
    }

    const booksRepository = new BooksRepository();
    this.servicesCache[ServicesIds.BOOKS_REPOSITORY] = booksRepository;

    return booksRepository;
  }
}

export const container = new ServicesContainer();
