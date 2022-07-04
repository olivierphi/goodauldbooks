import { PrismaClient as ProjectGutenbergImportPrismaClient } from "../prisma-client/index.js"
import { parseBookFromRdf } from "../queries/parse-book-from-rdf.ts"
import type { BookToParse } from "../types.ts"
import { traverseGeneratedCollectionDirectory } from "./traverse-rdf-library.ts"

const DB_BATCH_SIZE_DEFAULT = 100 // we will store books in DB only every N books

const prisma = new ProjectGutenbergImportPrismaClient()

type TraverseGeneratedCollectionDirectoryAndSaveToImportDbArgs = {
    collectionPath: string
    onRdfCallback?: (rdfFilePath: string, pgBookId: number) => void
}

export async function traverseGeneratedCollectionDirectoryAndSaveToImportDb({
    collectionPath,
    onRdfCallback,
}: TraverseGeneratedCollectionDirectoryAndSaveToImportDbArgs): Promise<void> {
    let currentBatch: BookToParse[] = []

    const saveCurrentBatch = async () => {
        await prisma.$transaction(
            currentBatch.map((bookToParse) => {
                return prisma.rawBook.upsert({
                    where: {
                        pgBookId: bookToParse.pgBookId,
                    },
                    update: {},
                    create: {
                        pgBookId: bookToParse.pgBookId,
                        assets: JSON.stringify(bookToParse.assets),
                        hasCover: bookToParse.hasCover,
                        hasIntro: bookToParse.hasIntro,
                        intro: bookToParse.intro,
                        rdfContent: bookToParse.rdfContent,
                    },
                })
            })
        )
    }

    const onRdfCallbackAddToBatch = async (rdfFilePath: string, pgBookId: number) => {
        onRdfCallback?.(rdfFilePath, pgBookId)

        const bookToParse = await parseBookFromRdf({ rdfFilePath, pgBookId })
        currentBatch.push(bookToParse)
        if (currentBatch.length === DB_BATCH_SIZE_DEFAULT) {
            await saveCurrentBatch()
            currentBatch = []
        }
    }

    await traverseGeneratedCollectionDirectory({ collectionPath, onRdfCallback })
    await saveCurrentBatch()
}
