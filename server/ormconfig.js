module.exports = {
  type: "sqlite",
  database: "./db.sqlite3",
  logging: true,
  entities: ["dist/orm/entities/**/*.js"],
  migrations: ["dist/orm/migrations/**/*.js"],
  subscribers: ["dist/orm/subscribers/**/*.js"],
  cli: {
    entitiesDir: "src/orm/entities",
    migrationsDir: "src/orm/migrations",
    subscribersDir: "src/orm/subscribers",
  },
  // TODO: use proper migrations :-)
  synchronize: true,
};
