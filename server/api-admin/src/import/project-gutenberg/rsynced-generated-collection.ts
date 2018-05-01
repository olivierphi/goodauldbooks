import { EventEmitter } from "events";
import * as fastGlob from "fast-glob";
import { dirname } from "path";
import { EmittedEvents } from ".";
import { container } from "../../services-container";
import * as asyncUtils from "../../utils/async-utils";
import { getImportedBookAssets } from "./assets";
import { emitEvent } from "./index";

export async function traverseDirectoryAndIndexBooks(
  localFolderPath: string,
  options: { eventEmitter?: EventEmitter } = {}
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    let rdfFileStreamFinished: boolean = false;
    let nbBooksImportsStarted: number = 0;
    let nbBooksImportsFinished: number = 0;

    const jobsDone = () =>
      rdfFileStreamFinished && nbBooksImportsFinished === nbBooksImportsStarted;

    const rdfFilesStream = fastGlob.stream([`${localFolderPath}/**/pg*.rdf`], {
      absolute: true,
      unique: true,
    });

    rdfFilesStream.on("data", async (rdfFilePath: string) => {
      const rdfRgexepMatch = rdfFilePath.match(/pg(\d+)\.rdf$/);
      if (rdfRgexepMatch && rdfRgexepMatch.length) {
        const bookId = parseInt(rdfRgexepMatch[1], 10);
        const bookFolderPath = dirname(rdfFilePath);
        nbBooksImportsStarted++;
        try {
          await storeBookInDatabaseRawImportsFromGeneratedCollectionFiles(
            bookFolderPath,
            rdfFilePath,
            bookId
          );
        } catch (e) {
          options.eventEmitter && options.eventEmitter.emit(EmittedEvents.IMPORT_ERROR, e);
        }
        nbBooksImportsFinished++;
        if (jobsDone()) {
          resolve(nbBooksImportsFinished);
        }
      }
    });
    rdfFilesStream.once("error", e => {
      console.log("RDF files stream error", e);
      reject(e);
    });
    rdfFilesStream.once("end", () => {
      rdfFileStreamFinished = true;
      if (jobsDone()) {
        resolve(nbBooksImportsFinished);
      }
    });
  });
}

export async function storeBookInDatabaseRawImportsFromGeneratedCollectionFiles(
  bookFolderPath: string,
  rdfFilePath: string,
  bookId: number,
  options: { eventEmitter?: EventEmitter } = {}
): Promise<void> {
  const rdfFileContent = await getBookRdfFileContent(rdfFilePath, "utf8", options);

  const bookAssets = await getImportedBookAssets(bookFolderPath, dirname(bookFolderPath));
  const bookAssetsAsHash: {[type: string]: any} = {};
  for (const asset of bookAssets) {
    bookAssetsAsHash[asset.type] = {path: asset.path, size: asset.size};
  }
  const bookAssetsAsJson = JSON.stringify(bookAssetsAsHash);

  await container.dbConnection.query(
    `
    insert into import.gutenberg_raw_rdf_files (gutenberg_id, rdf_content, assets)
      values ($1, $2, $3);
  `,
    [bookId, rdfFileContent, bookAssetsAsJson]
  );
}

export async function getBookRdfFileContent(
  rdfFilePath: string,
  encoding: string = "utf8",
  options: { eventEmitter?: EventEmitter } = {}
): Promise<string> {
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_FILE_READ_START);
  const rdfData = await asyncUtils.fs.readFileAsync(rdfFilePath, { encoding });
  emitEvent(options, EmittedEvents.BOOK_RDF_DATA_FILE_READ_END);

  if (!rdfData) {
    return Promise.reject(new Error(`Empty RDF file "${rdfFilePath}"`));
  }

  return rdfData;
}
