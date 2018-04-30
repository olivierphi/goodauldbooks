import { EventEmitter } from "events";
import { join as pathJoin } from "path";
import { ImportedBook } from "../../domain/import";
import { syncBookFilesFolder } from "./files-sync";

export type PGBookId = number;

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
  IMPORT_ERROR = "book_import:error",
}

export async function importBookFromProjectGutenberg(
  bookId: PGBookId,
  config: PGConfiguration,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; offline?: boolean } = {}
): Promise<ImportedBook> {
  try {
    await syncBookFilesFolder(bookId, config, targetFolderPath, options);
  } catch (e) {
    return Promise.reject(e);
  }

  const bookFilesPath = pathJoin(targetFolderPath, `${bookId}`);

  const bookRdfFilePath = pathJoin(bookFilesPath, `pg${bookId}.rdf`);

  return {
    folder: bookFilesPath,
    rdfFilePath: bookRdfFilePath,
  };
}

export function emitEvent(
  receivedOptions: { eventEmitter?: EventEmitter },
  event: EmittedEvents
): void {
  if (!receivedOptions.eventEmitter) {
    return;
  }
  receivedOptions.eventEmitter.emit(event);
}
