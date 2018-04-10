import { join as pathJoin } from "path";
import "reflect-metadata"; // required by TypeORM
import { Connection, ConnectionOptionsReader, createConnection } from "typeorm";

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

class ServicesContainer {
  private booted: boolean = false;

  public async boot(): Promise<boolean> {
    if (this.booted) {
      return Promise.resolve(false);
    }

    await this.initDbConnection();

    this.booted = true;
    return Promise.resolve(true);
  }

  get dbConnection(): Connection {
    if (!sharedServicesRegistry.has(SharedServicesIds.DB_CONNECTION)) {
      this.throwNotBootedError("dbConnection");
    }
    return sharedServicesRegistry.get(SharedServicesIds.DB_CONNECTION);
  }

  private async initDbConnection(): Promise<Connection> {
    // We have to build a ConnectionOptionsReader ourselves, as the Yarn workspace is confusing for the default one
    // (it will look for the "ormconfig" file in the project root rather than in the "server/" folder)
    const connectionOptionsReader = new ConnectionOptionsReader({
      root: pathJoin(__dirname, "../"),
    });
    const connectionOptions = await connectionOptionsReader.get("default");

    const connection = await createConnection(connectionOptions);

    sharedServicesRegistry.set(SharedServicesIds.DB_CONNECTION, connection);

    return Promise.resolve(connection);
  }

  private throwNotBootedError(serviceName: string) {
    throw new Error(
      `Service ${serviceName} requires a preliminary call to "ServiceContainer.boot()" method!`
    );
  }
}

export const container = new ServicesContainer();
