#!/usr/bin/env node

import { EventEmitter } from "events";
import * as yargs from "yargs";
import * as bookImportFromPG from "../import/project-gutenberg";
import {storeBookInDatabaseRawImportsFromGeneratedCollectionFiles} from "../import/project-gutenberg/rsynced-generated-collection";
import { container } from "../services-container";

interface Args {
  bookId: number;
  path: string;
  offline: boolean;
  mcMirrorUrl: string;
  mcMirrorModule?: string;
  gcMirrorUrl: string;
  gcMirrorModule?: string;
}

const argv: any = yargs
  .option("id", {
    alias: "bookId",
    describe: "Project Gutenberg book id",
    demandOption: true,
    type: "number",
  })
  .option("p", {
    alias: "path",
    describe: "target local folder path",
    demandOption: true,
  })
  .option("off", {
    alias: "offline",
    describe: "if target local folder path exists, don't sync it",
    type: "boolean",
    default: false,
  })
  .option("mcurl", {
    alias: "mcMirrorUrl",
    describe: "Project Gutenberg  'main collection' RSync mirror URL",
    demandOption: true,
  })
  .option("mcmod", {
    alias: "mcMirrorModule",
    describe: "Project Gutenberg 'main collection' RSync mirror module",
  })
  .option("gcurl", {
    alias: "gcMirrorUrl",
    describe: "Project Gutenberg 'generated collection' RSync mirror URL",
    demandOption: true,
  })
  .option("gcmod", {
    alias: "gcMirrorModule",
    describe: "Project Gutenberg 'generated collection' RSync mirror module",
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
      await importBook(input);
      await container.dbPool.end();
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

async function importBook(input: Args): Promise<boolean> {
  const projectGutenbergConfig: bookImportFromPG.PGConfiguration = {
    gutenbergMainCollectionRsyncData: {
      url: input.mcMirrorUrl,
      rsyncModule: input.mcMirrorModule,
    },
    gutenbergGeneratedCollectionRsyncData: {
      url: input.gcMirrorUrl,
      rsyncModule: input.gcMirrorModule,
    },
  };

  const eventEmitter = new EventEmitter();
  subscribeToImportEvents(eventEmitter, input.bookId);

  const importedBookData = await bookImportFromPG.importBookFromProjectGutenberg(
    input.bookId,
    projectGutenbergConfig,
    input.path,
    { offline: input.offline, eventEmitter }
  );

  await storeBookInDatabaseRawImportsFromGeneratedCollectionFiles(
    importedBookData.folder,
    importedBookData.rdfFilePath,
    input.bookId,
    { eventEmitter }
  );

  return true;
}

function subscribeToImportEvents(eventEmitter: EventEmitter, bookId: number): void {
  const mainCollectionStepName = "[main collection]";
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.MAIN_COLLECTION_SYNC_START,
    reportStepStart.bind(
      null,
      mainCollectionStepName,
      `Downloading content for Project Gutenberg book #${bookId}...`
    )
  );
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.MAIN_COLLECTION_SYNC_END,
    reportStepEnd.bind(null, mainCollectionStepName, `Content downloaded for book #${bookId}.`)
  );

  const generatedCollectionStepName = "[generated collection]";
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.GENERATED_COLLECTION_SYNC_START,
    reportStepStart.bind(
      null,
      generatedCollectionStepName,
      `Downloading content for Project Gutenberg book #${bookId}...`
    )
  );
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.GENERATED_COLLECTION_SYNC_END,
    reportStepEnd.bind(null, generatedCollectionStepName, `Content downloaded for book #${bookId}.`)
  );

  eventEmitter.on(
    bookImportFromPG.EmittedEvents.COLLECTIONS_SYNC_SKIPPED,
    console.log.bind(null, `#${bookId} book content already imported, skip sync.`)
  );

  const bookFileReadStepName = "[book file read]";
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.BOOK_RDF_DATA_FILE_READ_START,
    reportStepStart.bind(
      null,
      bookFileReadStepName,
      `Reading RDF file content for book #${bookId}...`
    )
  );
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.BOOK_RDF_DATA_FILE_READ_END,
    reportStepEnd.bind(null, bookFileReadStepName, `RDF file content read for book #${bookId}.`)
  );

  const bookRdfDataParsingStepName = "[book RDF data parsing]";
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.BOOK_RDF_DATA_PARSING_START,
    reportStepStart.bind(
      null,
      bookRdfDataParsingStepName,
      `Parsing RDF content for book #${bookId}...`
    )
  );
  eventEmitter.on(
    bookImportFromPG.EmittedEvents.BOOK_RDF_DATA_PARSING_END,
    reportStepEnd.bind(null, bookRdfDataParsingStepName, `RDF content parsed for book #${bookId}.`)
  );
}

const stepsStartTime: { [stepName: string]: number } = {};

function reportStepStart(stepName: string, msg: string): void {
  console.log(stepName.padEnd(30), msg);

  stepsStartTime[stepName] = Date.now();
}

function reportStepEnd(stepName: string, msg: string): void {
  const stepStartTime: number = stepsStartTime[stepName];

  console.log(
    stepName.padEnd(30),
    msg,
    `Took ${new Intl.NumberFormat().format(Math.round(Date.now() - stepStartTime))}ms.`
  );
}
