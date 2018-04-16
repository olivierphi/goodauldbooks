import { join as pathJoin } from "path";
import "reflect-metadata"; // required by TypeORM
import { Connection, ConnectionOptionsReader, createConnection } from "typeorm";
import { ServicesContainer } from "./../services-container";

export async function initDbConnection(container: ServicesContainer): Promise<Connection> {
  // We have to build a ConnectionOptionsReader ourselves, as the Yarn workspace is confusing for the default one
  // (it will look for the "ormconfig" file in the project root rather than in the "server/" folder)
  const connectionOptionsReader = new ConnectionOptionsReader({
    root: pathJoin(__dirname, "../../"),
  });
  const connectionOptions = await connectionOptionsReader.get("default");

  const connection = await createConnection(connectionOptions);

  return Promise.resolve(connection);
}
