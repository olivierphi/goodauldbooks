import { EventEmitter } from "events";
import { readFile, stat } from "fs";
import { join as pathJoin } from "path";
import * as traverse from "traverse";
import { promisify } from "util";
import { parseString } from "xml2js";
import { Genre, ImportedBook } from "../domain/import";
import { downloadFolderViaRsync } from "../utils/download-utils";
import { getPathFromBookId } from "../utils/project-gutenberg-utils";
import * as rdfParsing from "./project-gutenberg-rdf-parsing";

// Some promisification first? Sure!
const readFileAsync = promisify(readFile);
// (don't know why TypeScript does wrong assertions on that type... I have to cast it with "as" :-/)
const parseStringAsync = promisify(parseString) as (xml: string) => Promise<{}>;

type ProjectGutenbergBookId = number;

/**
 * A Project Gutenberg configuration
 */
export interface PGConfiguration {
  // A RSync mirror.
  // @link http://www.gutenberg.org/wiki/Gutenberg:Mirroring_How-To#Using_Rsync
  gutenbergMainCollectionRsyncData: PGMirrorData;
  // Ditto.
  gutenbergGeneratedCollectionRsyncData: PGMirrorData;
}

/**
 * A Project Gutenberg mirror data
 */
export interface PGMirrorData {
  url: string;
  rsyncModule?: string;
  username?: string;
}

export enum EmittedEvents {
  MAIN_COLLECTION_SYNC_START = "main_collection:sync:start",
  MAIN_COLLECTION_SYNC_END = "main_collection:sync:end",
  GENERATED_COLLECTION_SYNC_START = "generated_collection:sync:start",
  GENERATED_COLLECTION_SYNC_END = "generated_collection:sync:end",
  COLLECTIONS_SYNC_SKIPPED = "collection:sync:skipped",
  BOOK_RDF_DATA_FILE_READ_START = "book_rdf_data:file_read:start",
  BOOK_RDF_DATA_FILE_READ_END = "book_rdf_data:file_read:end",
  BOOK_RDF_DATA_PARSING_START = "book_rdf_data:parsing:start",
  BOOK_RDF_DATA_PARSING_END = "book_rdf_data:parsing:end",
}

export async function importBookFromProjectGutenberg(
  bookId: ProjectGutenbergBookId,
  config: PGConfiguration,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; offline?: boolean } = {}
): Promise<ImportedBook> {
  await syncBookFilesFolder(bookId, config, targetFolderPath, options);

  const bookFilesPath = pathJoin(targetFolderPath, `${bookId}`);

  const bookRdfFilePath = pathJoin(bookFilesPath, `pg${bookId}.rdf`);
  const importedBookData = await extractBookDataFromRdfFile(bookRdfFilePath, "utf8", {
    eventEmitter: options.eventEmitter,
  });

  return Promise.resolve(importedBookData);
}

export async function syncBookFilesFolder(
  bookId: ProjectGutenbergBookId,
  config: PGConfiguration,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; offline?: boolean } = {}
): Promise<boolean> {
  let syncFolder: boolean = true;

  if (options.offline) {
    const testFilePath = pathJoin(targetFolderPath, `${bookId}`, `pg${bookId}.epub`);
    try {
      const targetFolderStats = await promisify(stat)(testFilePath);
      if (targetFolderStats.isFile) {
        syncFolder = false;
      }
    } catch {
      syncFolder = true;
    }
  }

  if (!syncFolder) {
    emitEvent(options, EmittedEvents.COLLECTIONS_SYNC_SKIPPED);
    return Promise.resolve(false);
  }

  const mainCollectionSyncProcess = downloadEbookMainCollectionContent(
    bookId,
    {
      url: config.gutenbergMainCollectionRsyncData.url,
      rsyncModule: config.gutenbergMainCollectionRsyncData.rsyncModule,
      username: config.gutenbergMainCollectionRsyncData.username,
    },
    targetFolderPath
  );
  const generatedCollectionSyncProcess = downloadEbookGeneratedCollectionContent(
    bookId,
    {
      url: config.gutenbergGeneratedCollectionRsyncData.url,
      rsyncModule: config.gutenbergGeneratedCollectionRsyncData.rsyncModule,
      username: config.gutenbergGeneratedCollectionRsyncData.username,
    },
    targetFolderPath
  );

  await Promise.all([mainCollectionSyncProcess, generatedCollectionSyncProcess]);

  return Promise.resolve(true);
}

export async function extractBookDataFromRdfXmlData(
  rdfDataXmlString: string,
  options: { eventEmitter?: EventEmitter } = {}
): Promise<ImportedBook> {
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_PARSING_START);

  const rdfData = await parseStringAsync(rdfDataXmlString);
  const rdfDataTraverser = traverse(rdfData);

  const gutenbergId = rdfParsing.getProjectGutenbergId(rdfDataTraverser);
  const author = rdfParsing.getAuthor(rdfDataTraverser);
  const lang = rdfParsing.getLanguage(rdfDataTraverser);
  const titleRaw = rdfParsing.getTitle(rdfDataTraverser);
  const title = { [lang]: titleRaw };
  const genresRaw = rdfParsing.getGenres(rdfDataTraverser);
  const genres = genresRaw.map((genreRaw: string): Genre => {
    return { name: { [lang]: genreRaw } };
  });

  const importedBook: ImportedBook = {
    gutenbergId,
    author,
    title,
    genres,
  };

  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_PARSING_END);

  return Promise.resolve(importedBook);
}

export async function extractBookDataFromRdfFile(
  rdfFilePath: string,
  encoding: string = "utf8",
  options: { eventEmitter?: EventEmitter } = {}
) {
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_FILE_READ_START);
  const rdfData = await readFileAsync(rdfFilePath, { encoding });
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_FILE_READ_END);

  return extractBookDataFromRdfXmlData(rdfData, options);
}

export async function downloadEbookMainCollectionContent(
  bookId: ProjectGutenbergBookId,
  config: PGMirrorData,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; echo?: boolean } = {}
) {
  const bookSourcePath = getPathFromBookId(bookId); // "main collection" use path "3/4/345" for book #345

  emitEvent(options, EmittedEvents.MAIN_COLLECTION_SYNC_START);

  await downloadFolderViaRsync(config.url, bookSourcePath, targetFolderPath, {
    progress: options.echo,
    echo: options.echo,
    rsyncModule: config.rsyncModule,
  });

  emitEvent(options, EmittedEvents.MAIN_COLLECTION_SYNC_END);
}

export async function downloadEbookGeneratedCollectionContent(
  bookId: ProjectGutenbergBookId,
  config: PGMirrorData,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; echo?: boolean } = {}
) {
  const bookSourcePath = bookId.toString(); // "main collection" use path "/345" for book #345
  await downloadFolderViaRsync(config.url, bookSourcePath, targetFolderPath, {
    progress: options.echo,
    echo: options.echo,
    rsyncModule: config.rsyncModule,
  });
}

function emitEvent(receivedOptions: { eventEmitter?: EventEmitter }, event: EmittedEvents): void {
  if (!receivedOptions.eventEmitter) {
    return;
  }
  receivedOptions.eventEmitter.emit(event);
}
