#!/usr/bin/env node

import * as yargs from "yargs";
import { Book } from "../orm/entities/book";
import { BookRepository } from "../orm/repositories/book-repository";
import { container } from "../services-container";

interface Args {
  pattern: string;
  similarity?: number;
}

const argv: any = yargs
  .command("$0 <pattern>", "the default command", defaultArgv => {
    return defaultArgv
      .positional("pattern", {
        type: "string",
      })
      .option("similarity", {
        type: "number",
      });
  })
  .help().argv;

processCommand(argv)
  .then(process.exit.bind(null, 0))
  .catch(e => {
    console.error("Error:", e);
    process.exit(1);
  });

async function processCommand(input: Args) {
  console.log(input);
  return new Promise(async (resolve, reject) => {
    try {
      await container.boot();
      await searchBooks(input);
      await container.dbConnection.close();
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

async function searchBooks(input: Args) {
  const matchingBooks = await container.dbConnection
    .getCustomRepository(BookRepository)
    .searchBooks(input.pattern, input.similarity);
  return matchingBooks;
}
