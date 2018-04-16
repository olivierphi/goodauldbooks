import { EventEmitter } from "events";
import { readFile, stat } from "fs";
import { join as pathJoin } from "path";
import * as traverse from "traverse";
import { Genre, ImportedBook } from "../../domain/import";
import * as asyncUtils from "../../utils/async-utils";
import { downloadFolderViaRsync } from "../../utils/download-utils";
import { getPathFromBookId } from "../../utils/project-gutenberg-utils";
import { emitEvent, EmittedEvents, PGBookId, PGConfiguration, PGMirrorData } from "./index";
import * as rdfParsing from "./rdf-parsing";

export async function syncBookFilesFolder(
  bookId: PGBookId,
  config: PGConfiguration,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; offline?: boolean } = {}
): Promise<boolean> {
  let syncFolder: boolean = true;

  if (options.offline) {
    const testFilePath = pathJoin(targetFolderPath, `${bookId}`, `pg${bookId}.epub`);
    try {
      const targetFolderStats = await asyncUtils.fs.statAsync(testFilePath);
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

export async function downloadEbookMainCollectionContent(
  bookId: PGBookId,
  config: PGMirrorData,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; echo?: boolean } = {}
) {
  const bookSourcePath = getPathFromBookId(bookId); // "main collection" use path "3/4/345" for book #345

  emitEvent(options, EmittedEvents.MAIN_COLLECTION_SYNC_START);

  try {
    await downloadFolderViaRsync(config.url, bookSourcePath, targetFolderPath, {
      progress: options.echo,
      echo: options.echo,
      rsyncModule: config.rsyncModule,
    });
  } catch (e) {
    console.log(`main collection sync failed for book #${bookId}`);
    return Promise.reject(e);
  }

  emitEvent(options, EmittedEvents.MAIN_COLLECTION_SYNC_END);
}

export async function downloadEbookGeneratedCollectionContent(
  bookId: PGBookId,
  config: PGMirrorData,
  targetFolderPath: string,
  options: { eventEmitter?: EventEmitter; echo?: boolean } = {}
) {
  const bookSourcePath = bookId.toString(); // "main collection" use path "/345" for book #345

  try {
    await downloadFolderViaRsync(config.url, bookSourcePath, targetFolderPath, {
      progress: options.echo,
      echo: options.echo,
      rsyncModule: config.rsyncModule,
    });
  } catch (e) {
    console.log(`generated collection sync failed for book #${bookId}`);
    return Promise.reject(e);
  }
}
