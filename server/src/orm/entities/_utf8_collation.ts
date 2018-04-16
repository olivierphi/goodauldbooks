export const utf8 = { collation: "C.UTF-8" }; // no collation-par-column for PostgreSQL
// (available collations can be found in the "postgres » pg_catalog » pg_collation" table, or by typing `\dOS` in psql)

// export const utf8 = { charset: "UTF-8" }; // for SQLite
// export const utf8 = { charset: "utf8", collation: "utf8_general_ci" }; //for MySQL
