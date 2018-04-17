#!/usr/bin/env node

import { EventEmitter } from "events";
import * as fs from "fs";
import * as yargs from "yargs";
import * as bookImportFromPG from "../import/project-gutenberg";
import { traverseDirectoryAndIndexBooks } from "../import/project-gutenberg/rsynced-generated-collection";
import { container } from "../services-container";
import * as asyncUtils from "../utils/async-utils";

interface Args {
  path: string;
}

const argv: any = yargs
  .option("p", {
    alias: "path",
    describe: "generated collection local folder path",
    demandOption: true,
  })
  .help().argv;

processCommand(argv)
  .then(process.exit.bind(null, 0))
  .catch(e => {
    console.error("Error:", e);
    process.exit(1);
  });

async function processCommand(input: Args) {
  return new Promise(async (resolve, reject) => {
    try {
      await container.boot();
      const nbBookImported = await importRsyncedGeneratedCollection(input.path);
      console.log(`Nb books imported: ${nbBookImported}`);
      await container.dbConnection.close();
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

async function importRsyncedGeneratedCollection(generatedCollectionPath: string): Promise<number> {
  const eventEmitter = new EventEmitter();
  subscribeToImportEvents(
    eventEmitter,
    generatedCollectionPath,
    "/home/oliv/test/gutenberg-error.log"
  );

  const nbBooksImported = await traverseDirectoryAndIndexBooks(generatedCollectionPath, {
    eventEmitter,
  });

  return nbBooksImported;
}

async function subscribeToImportEvents(
  eventEmitter: EventEmitter,
  importPath: string,
  logFilePath: string
): Promise<void> {
  const logFileStream = fs.createWriteStream(logFilePath, {
    flags: "w",
  });
  eventEmitter.on(bookImportFromPG.EmittedEvents.IMPORT_ERROR, err => {
    logFileStream.write(`${err}\n`);
  });
}