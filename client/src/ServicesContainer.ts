import { i18n as i18next } from "i18next";
import { Store } from "redux";
import { initI18n } from "./boot/i18n-init";
import * as queriesDomain from "./domain/queries";
import { BooksRepository } from "./repositories/BooksRepository";
import { AppState } from "./store";
import { initStore } from "./store-init";

enum SharedServicesIds {
  APP_STATE_STORE,
  BOOKS_REPOSITORY,
  I18N,
}

type SharedServicesRegistry = Map<SharedServicesIds, any>;

const sharedServicesRegistry: SharedServicesRegistry = new Map();
function sharedService(serviceId: SharedServicesIds, serviceFactory: () => any) {
  if (sharedServicesRegistry.has(serviceId)) {
    return sharedServicesRegistry.get(serviceId);
  }
  const serviceSharedInstance: any = serviceFactory();
  sharedServicesRegistry.set(serviceId, serviceSharedInstance);
  return serviceSharedInstance;
}

export class ServicesContainer {
  private booted: boolean = false;

  public async boot(): Promise<boolean> {
    if (this.booted) {
      return false;
    }

    // Let's boot our async services!
    await this.bootAsyncServices();

    this.booted = true;
    return true;
  }

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

  get i18n(): i18next {
    if (!sharedServicesRegistry.has(SharedServicesIds.I18N)) {
      this.throwNotBootedError("i18n");
    }
    return sharedServicesRegistry.get(SharedServicesIds.I18N);
  }

  private async bootAsyncServices() {
    // i18n
    const i18n = await initI18n(this);
    sharedServicesRegistry.set(SharedServicesIds.I18N, i18n);
  }

  private throwNotBootedError(serviceName: string) {
    throw new Error(
      `Service ${serviceName} requires a preliminary call to "ServiceContainer.boot()" method!`
    );
  }
}

export const container = new ServicesContainer();
