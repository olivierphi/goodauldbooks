import { EventEmitter } from "node:events"
import * as fastGlob from "fast-glob"
import { EmittedEvents, RDF_FILES_COLLECTION_GLOB, RDF_FILE_REGEX } from "../constants.ts"

type TraverseGeneratedCollectionDirectoryArgs = {
    collectionPath: string
    onRdfCallback?: (rdfFilePath: string, pgBookId: number) => void
    options?: { eventEmitter?: EventEmitter }
}

export async function traverseGeneratedCollectionDirectory({
    collectionPath,
    onRdfCallback,
    options,
}: TraverseGeneratedCollectionDirectoryArgs): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        let rdfFileStreamFinished: boolean = false
        let nbBooksTraversed: number = 0

        const rdfFilesStream = fastGlob.stream([`${collectionPath}/${RDF_FILES_COLLECTION_GLOB}`], {
            absolute: true,
            unique: true,
        })

        rdfFilesStream.on("data", async (rdfFilePath: string) => {
            const rdfRegexMatch = rdfFilePath.match(RDF_FILE_REGEX)
            if (rdfRegexMatch?.length) {
                const bookId = parseInt(rdfRegexMatch[1], 10)
                if (onRdfCallback) {
                    try {
                        onRdfCallback(rdfFilePath, bookId)
                    } catch (e) {
                        options?.eventEmitter?.emit(EmittedEvents.IMPORT_ERROR, e)
                    }
                }
                nbBooksTraversed++
            }
        })

        rdfFilesStream.once("error", (e) => {
            console.log("RDF files stream error", e)
            reject(e)
        })

        rdfFilesStream.once("end", () => {
            rdfFileStreamFinished = true
            resolve(nbBooksTraversed)
        })
    })
}
