module.exports = {
  type: "postgres",
  // PostgreSQL connection options:
  host: "localhost",
  port: "5433",
  username: "postgres",
  password: "local",
  database: "goodauldbooks",
  // TypeORM options:
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
