import * as debugFunc from "debug";
import { Pool, QueryResult } from "pg";

const debug = debugFunc("app:db");

/**
 * Just a thin wrapper around "pg" - @link https://node-postgres.com/guides/project-structure
 */
export class ConnectionWrapper {
  constructor(private dbPool: Pool) {}

  public query(sql: string, params: any[]): Promise<QueryResult> {
    debug(sql, params);
    console.log(sql, params);
    return this.dbPool.query(sql, params);
  }

  // Well, that's enough for today! We will implement the "getClient" method when we need it :-)
}
