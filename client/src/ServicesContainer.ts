import * as queriesDomain from "./domain/queries";
import { BooksRepository } from "./repositories/BooksRepository";

enum SharedServicesIds {
  BOOKS_REPOSITORY,
}

interface SharedServicesRegistry {
  [serviceId: number]: any;
}

const sharedServicesRegistry: SharedServicesRegistry = {};
function sharedService(
  serviceId: SharedServicesIds,
  serviceFactory: () => any
) {
  if (sharedServicesRegistry[serviceId]) {
    return sharedServicesRegistry[serviceId];
  }
  const serviceSharedInstance: any = serviceFactory();
  sharedServicesRegistry[serviceId] = serviceSharedInstance;
  return serviceSharedInstance;
}

class ServicesContainer {
  get booksRepository(): queriesDomain.BooksRepository {
    return sharedService(SharedServicesIds.BOOKS_REPOSITORY, () => {
      const booksRepository = new BooksRepository();

      return booksRepository;
    });
  }
}

export const container = new ServicesContainer();
