import { downloadFolderViaRsync } from "../utils/download-utils";
import { getPathFromBookId } from "../utils/project-gutenberg-utils";

type ProjectGutenbergBookId = number;

export async function importBookFromProjectGutenberg(
  bookId: ProjectGutenbergBookId,
  config: ProjectGutenbergRelatedConfiguration,
  targetFolderPath: string
) {
  // Let's keep it simple and stupid at the moment, we'll improve it later on if we need to :-)
}

/*
async function extractRdfFileFromLocalArchive(
  bookId: ProjectGutenbergBookId,
  config: ProjectGutenbergRelatedConfiguration,
  targetFolderPath: string
) {}

function extractBookDataFromRdfXmlData(rdfData: string) {}

async function extractBookDataFromRdfFile(rdfFilePath: string) {}
*/

export async function downloadEbookMainCollectionContent(
  bookId: ProjectGutenbergBookId,
  config: ProjectGutenbergMirrorData,
  targetFolderPath: string,
  options: { echo?: boolean } = {}
) {
  const bookSourcePath = getPathFromBookId(bookId); // "main collection" use path "3/4/345" for book #345
  await downloadFolderViaRsync(config.url, bookSourcePath, targetFolderPath, {
    progress: options.echo,
    echo: options.echo,
    rsyncModule: config.rsyncModule,
  });
}

export async function downloadEbookGeneratedCollectionContent(
  bookId: ProjectGutenbergBookId,
  config: ProjectGutenbergMirrorData,
  targetFolderPath: string,
  options: { echo?: boolean } = {}
) {
  const bookSourcePath = bookId.toString(); // "main collection" use path "/345" for book #345
  await downloadFolderViaRsync(config.url, bookSourcePath, targetFolderPath, {
    progress: options.echo,
    echo: options.echo,
    rsyncModule: config.rsyncModule,
  });
}

export interface ProjectGutenbergRelatedConfiguration {
  // This path is the one of the complete RDF archive of the Project Gutenberg catalog.
  // @link http://www.gutenberg.org/wiki/Gutenberg:Feeds#The_Complete_Project_Gutenberg_Catalog
  gutenbergRdfDataLocalZipPath: string;
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
