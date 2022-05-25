import type { BookToParse } from "../types"
import { traverseGeneratedCollectionDirectory } from "./traverse-rdf-library"
import { parseBookFromRdf } from "../queries/parse-book-from-rdf"
import { PrismaClient } from "../prisma-client"

const DB_BATCH_SIZE_DEFAULT = 150 // we will store books in DB only every N books

const prisma = new PrismaClient()

type TraverseGeneratedCollectionDirectoryAndSaveToImportDbArgs = {
    collectionPath: string
}

export async function traverseGeneratedCollectionDirectoryAndSaveToImportDb({
    collectionPath,
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

    const onRdfCallback = async (rdfFilePath: string, pgBookId: number) => {
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
