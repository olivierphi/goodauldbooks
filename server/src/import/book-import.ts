import { EventEmitter } from "events";
import { readFile, stat } from "fs";
import { join as pathJoin } from "path";
import * as traverse from "traverse";
import { promisify } from "util";
import { parseString } from "xml2js";
import { Author, Genre, ImportedBook, Lang } from "../domain/import";
import { downloadFolderViaRsync } from "../utils/download-utils";
import { getPathFromBookId } from "../utils/project-gutenberg-utils";

// Some promisification first? Sure!
const readFileAsync = promisify(readFile);
const parseStringAsync = promisify(parseString) as (xml: string) => Promise<{}>;

type ProjectGutenbergBookId = number;

export interface ProjectGutenbergRelatedConfiguration {
  // A RSync mirror.
  // @link http://www.gutenberg.org/wiki/Gutenberg:Mirroring_How-To#Using_Rsync
  gutenbergMainCollectionRsyncData: ProjectGutenbergMirrorData;
  // Ditto.
  gutenbergGeneratedCollectionRsyncData: ProjectGutenbergMirrorData;
}

export interface ProjectGutenbergMirrorData {
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
  config: ProjectGutenbergRelatedConfiguration,
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
  config: ProjectGutenbergRelatedConfiguration,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; offline?: boolean } = {}
): Promise<boolean> {
  let syncFolder: boolean = true;

  if (options.offline) {
    const testFilePath = pathJoin(targetFolderPath, `${bookId}`, `pg${bookId}.epub`);
    try {
      const targetFolderStats = await promisify(stat)(testFilePath);
      if (targetFolderStats.isFile) {
        options.eventEmitter &&
          options.eventEmitter.emit(EmittedEvents.COLLECTIONS_SYNC_SKIPPED);
        syncFolder = false;
      }
    } catch {
      syncFolder = true;
    }
  }

  if (!syncFolder) {
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
  options.eventEmitter &&
    options.eventEmitter.emit(EmittedEvents.BOOK_RDF_DATA_PARSING_START);

  const rdfData = await parseStringAsync(rdfDataXmlString);
  const rdfDataTraverser = traverse(rdfData);

  const gutenbergId = ProjectGutenbergRDFParsing.getProjectGutenbergId(rdfDataTraverser);
  const author = ProjectGutenbergRDFParsing.getAuthor(rdfDataTraverser);
  const lang = ProjectGutenbergRDFParsing.getLanguage(rdfDataTraverser);
  const titleRaw = ProjectGutenbergRDFParsing.getTitle(rdfDataTraverser);
  const title = { [lang]: titleRaw };
  const genresRaw = ProjectGutenbergRDFParsing.getGenres(rdfDataTraverser);
  const genres = genresRaw.map((genreRaw: string): Genre => {
    return { name: { [lang]: genreRaw } };
  });

  const importedBook: ImportedBook = {
    gutenbergId,
    author,
    title,
    genres,
  };

  options.eventEmitter &&
    options.eventEmitter.emit(EmittedEvents.BOOK_RDF_DATA_PARSING_END);

  return Promise.resolve(importedBook);
}

export async function extractBookDataFromRdfFile(
  rdfFilePath: string,
  encoding: string = "utf8",
  options: { eventEmitter?: EventEmitter } = {}
) {
  options.eventEmitter &&
    options.eventEmitter.emit(EmittedEvents.BOOK_RDF_DATA_FILE_READ_START);
  const rdfData = await readFileAsync(rdfFilePath, { encoding });
  options.eventEmitter &&
    options.eventEmitter.emit(EmittedEvents.BOOK_RDF_DATA_FILE_READ_END);

  return extractBookDataFromRdfXmlData(rdfData, options);
}

export async function downloadEbookMainCollectionContent(
  bookId: ProjectGutenbergBookId,
  config: ProjectGutenbergMirrorData,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; echo?: boolean } = {}
) {
  const bookSourcePath = getPathFromBookId(bookId); // "main collection" use path "3/4/345" for book #345

  options.eventEmitter &&
    options.eventEmitter.emit(EmittedEvents.MAIN_COLLECTION_SYNC_START);

  await downloadFolderViaRsync(config.url, bookSourcePath, targetFolderPath, {
    progress: options.echo,
    echo: options.echo,
    rsyncModule: config.rsyncModule,
  });

  options.eventEmitter &&
    options.eventEmitter.emit(EmittedEvents.MAIN_COLLECTION_SYNC_END);
}

export async function downloadEbookGeneratedCollectionContent(
  bookId: ProjectGutenbergBookId,
  config: ProjectGutenbergMirrorData,
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

namespace ProjectGutenbergRDFParsing {
  /**
   * I could have used XPath and stuff like that, but I really hate XML parsing, so why not
   * converting all the XML data into a big object and then retrive its data via Traverser? ^_^
   */

  const BOOK_CATEGORY_RDF_RESOURCE_TYPE = "http://purl.org/dc/terms/LCSH";

  export function getProjectGutenbergId(rdfTraverser: traverse.Traverse<{}>): number {
    const projectGutenbergIdStr = rdfTraverser.get([
      "rdf:RDF",
      "pgterms:ebook",
      "0",
      "$",
      "rdf:about",
    ]);

    const gutenbergBookId = parseInt(projectGutenbergIdStr.replace(/^ebooks\/(\d+)$/, "$1"), 10);

    return gutenbergBookId;
  }

  export function getPublisher(rdfTraverser: traverse.Traverse<{}>): string {
    return rdfTraverser.get(["rdf:RDF", "pgterms:ebook", "0", "dcterms:publisher", "0"]);
  }

  export function getTitle(rdfTraverser: traverse.Traverse<{}>): string {
    return rdfTraverser.get(["rdf:RDF", "pgterms:ebook", "0", "dcterms:title", "0"]);
  }

  export function getLanguage(rdfTraverser: traverse.Traverse<{}>): Lang {
    return rdfTraverser.get([
      "rdf:RDF",
      "pgterms:ebook",
      "0",
      "dcterms:language",
      "0",
      "rdf:Description",
      "0",
      "rdf:value",
      "0",
      "_",
    ]);
  }

  export function getAuthor(rdfTraverser: traverse.Traverse<{}>): Author {
    const authorRaw: any = rdfTraverser.get([
      "rdf:RDF",
      "pgterms:ebook",
      "0",
      "dcterms:creator",
      "0",
      "pgterms:agent",
      "0",
    ]);

    const projectGutenbergAgentStr: string = authorRaw.$["rdf:about"];
    const birthYearStr: string = authorRaw["pgterms:birthdate"]["0"]._;
    const deathYearStr: string = authorRaw["pgterms:deathdate"]["0"]._;
    const wikipediaUrl: string = authorRaw["pgterms:webpage"]["0"].$["rdf:resource"];
    const nameStr: string = authorRaw["pgterms:name"]["0"];

    const gutenbergAuthorId = parseInt(
      projectGutenbergAgentStr.replace(/^\d{4}\/agents\/(\d+)$/, "$1"),
      10
    );
    const [lastName, firstName] = nameStr.split(", ");

    return {
      gutenbergId: gutenbergAuthorId,
      firstName,
      lastName,
      wikipediaUrl,
      birthYear: parseInt(birthYearStr, 10),
      deathYear: deathYearStr ? parseInt(deathYearStr, 10) : null,
    };
  }

  export function getGenres(rdfTraverser: traverse.Traverse<{}>): string[] {
    const categoriesRaw: Array<{}> = rdfTraverser.get([
      "rdf:RDF",
      "pgterms:ebook",
      "0",
      "dcterms:subject",
    ]);

    const categories = categoriesRaw.map((dcTermsSubjectData: any): string => {
      const rdfDescription = dcTermsSubjectData["rdf:Description"][0];
      if (
        rdfDescription["dcam:memberOf"][0].$["rdf:resource"] !== BOOK_CATEGORY_RDF_RESOURCE_TYPE
      ) {
        return "";
      }
      return rdfDescription["rdf:value"][0];
    });

    return categories.filter(x => !!x);
  }
}
