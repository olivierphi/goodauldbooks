import { EventEmitter } from "node:events"
import * as fastGlob from "fast-glob"
import { RDF_FILE_REGEX, EmittedEvents, RDF_FILES_COLLECTION_GLOB } from "../constants"

type Args = {
    collectionPath: string
    onRdfCallback: (rdfFilePath: string, pgBookId: number) => void
    options?: { eventEmitter?: EventEmitter }
}

export async function traverseGeneratedCollectionDirectory(args: Args): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        let rdfFileStreamFinished: boolean = false
        let nbBooksTraversed: number = 0

        const rdfFilesStream = fastGlob.stream([`${args.collectionPath}/${RDF_FILES_COLLECTION_GLOB}`], {
            absolute: true,
            unique: true,
        })

        rdfFilesStream.on("data", async (rdfFilePath: string) => {
            const rdfRegexMatch = rdfFilePath.match(RDF_FILE_REGEX)
            if (rdfRegexMatch?.length) {
                const bookId = parseInt(rdfRegexMatch[1], 10)
                try {
                    args.onRdfCallback(rdfFilePath, bookId)
                } catch (e) {
                    args.options?.eventEmitter?.emit(EmittedEvents.IMPORT_ERROR, e)
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
