import { Pool } from "pg";
import { ServicesContainer } from "./../services-container";

import * as debugFunc from "debug";

const debug = debugFunc("app:boot");

export async function initDbConnection(container: ServicesContainer): Promise<Pool> {
  debug(`Connection to db ${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}...`);

  const pool = new Pool();
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  // Checking the connection :-)
  const client = await pool.connect();
  await client.query("select current_user");
  client.release();

  debug(`Connection successful.`);

  return pool;
}
