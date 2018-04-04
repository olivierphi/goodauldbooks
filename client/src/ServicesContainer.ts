import {Store} from "redux";
import * as queriesDomain from "./domain/queries";
import { BooksRepository } from "./repositories/BooksRepository";
import {AppState} from "./store";
import {initStore} from "./store-init";

enum SharedServicesIds {
  APP_STATE_STORE,
  BOOKS_REPOSITORY,
}

type SharedServicesRegistry = Map<SharedServicesIds, any>;

const sharedServicesRegistry: SharedServicesRegistry = new Map();
function sharedService(
  serviceId: SharedServicesIds,
  serviceFactory: () => any
) {
  if (sharedServicesRegistry.has(serviceId)) {
    return sharedServicesRegistry.get(serviceId);
  }
  const serviceSharedInstance: any = serviceFactory();
  sharedServicesRegistry.set(serviceId, serviceSharedInstance);
  return serviceSharedInstance;
}

class ServicesContainer {
  get appStateStore(): Store<AppState> {
    return sharedService(SharedServicesIds.APP_STATE_STORE, () => {
      return initStore();
    });
  }

  get booksRepository(): queriesDomain.BooksRepository {
    return sharedService(SharedServicesIds.BOOKS_REPOSITORY, () => {
      return new BooksRepository(this.appStateStore);
    });
  }
}

export const container = new ServicesContainer();
