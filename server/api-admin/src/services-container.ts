import * as debugFunc from "debug";
import { Pool } from "pg";
import { initDbConnection } from "./boot/db-connection-init";
import { ConnectionWrapper } from "./db/connection-wrapper";

const debug = debugFunc("app:container");

enum SharedServicesIds {
  DB_POOL,
  DB_CONNECTION_WRAPPER,
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
    debug("Booting services container...");
    await this.bootAsyncServices();
    debug("Services container booted.");

    this.booted = true;
    return true;
  }

  get dbPool(): Pool {
    if (!sharedServicesRegistry.has(SharedServicesIds.DB_POOL)) {
      this.throwNotBootedError("dbPool");
    }
    return sharedServicesRegistry.get(SharedServicesIds.DB_POOL);
  }

  get dbConnection(): ConnectionWrapper {
    if (!sharedServicesRegistry.has(SharedServicesIds.DB_POOL)) {
      const dbConnectionWrapper = new ConnectionWrapper(this.dbPool);
      sharedServicesRegistry.set(SharedServicesIds.DB_POOL, dbConnectionWrapper);
    }
    return sharedServicesRegistry.get(SharedServicesIds.DB_POOL);
  }

  private async bootAsyncServices() {
    // DB connection
    const dbPool = await initDbConnection(this);
    sharedServicesRegistry.set(SharedServicesIds.DB_POOL, dbPool);
  }

  private throwNotBootedError(serviceName: string) {
    throw new Error(
      `Service ${serviceName} requires a preliminary call to "ServiceContainer.boot()" method!`
    );
  }
}

export const container = new ServicesContainer();
