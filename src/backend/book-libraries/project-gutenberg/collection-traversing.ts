import { EventEmitter } from "events";
import * as fastGlob from "fast-glob";
import { EmittedEvents } from "./domain";

export type onRdfCallback = (rdfFilePath: string, bookId: number) => void;

export async function traverseGeneratedCollectionDirectory(
    collectionPath: string,
    onRdfCallback: onRdfCallback,
    options: { eventEmitter?: EventEmitter } = {},
): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        let nbBooksTraversed = 0;

        const rdfFilesStream = fastGlob.stream([`${collectionPath}/**/pg*.rdf`], {
            absolute: true,
            unique: true,
        });

        rdfFilesStream.on("data", async (rdfFilePath: string) => {
            const rdfRgexepMatch = rdfFilePath.match(/pg(\d+)\.rdf$/);
            if (rdfRgexepMatch && rdfRgexepMatch.length) {
                const bookId = parseInt(rdfRgexepMatch[1], 10);
                try {
                    onRdfCallback(rdfFilePath, bookId);
                } catch (e) {
                    options.eventEmitter && options.eventEmitter.emit(EmittedEvents.IMPORT_ERROR, e);
                }
                nbBooksTraversed++;
            }
        });

        rdfFilesStream.once("error", (e) => {
            console.log("RDF files stream error", e);
            reject(e);
        });

        rdfFilesStream.once("end", () => {
            resolve(nbBooksTraversed);
        });
    });
}
