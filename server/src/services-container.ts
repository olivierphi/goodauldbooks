import { Connection } from "typeorm";
import { initDbConnection } from "./boot/db-connection-init";

enum SharedServicesIds {
  DB_CONNECTION,
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
      return Promise.resolve(false);
    }

    // Let's boot our async services!
    await this.bootAsyncServices();

    this.booted = true;
    return Promise.resolve(true);
  }

  get dbConnection(): Connection {
    if (!sharedServicesRegistry.has(SharedServicesIds.DB_CONNECTION)) {
      this.throwNotBootedError("dbConnection");
    }
    return sharedServicesRegistry.get(SharedServicesIds.DB_CONNECTION);
  }

  private async bootAsyncServices() {
    // DB connection
    const dbConnection = await initDbConnection(this);
    sharedServicesRegistry.set(SharedServicesIds.DB_CONNECTION, dbConnection);
  }

  private throwNotBootedError(serviceName: string) {
    throw new Error(
      `Service ${serviceName} requires a preliminary call to "ServiceContainer.boot()" method!`
    );
  }
}

export const container = new ServicesContainer();
