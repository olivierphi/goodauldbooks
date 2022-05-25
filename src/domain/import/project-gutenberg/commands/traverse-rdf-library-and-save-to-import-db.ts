import type { BookToParse } from "../types.ts"
import { traverseGeneratedCollectionDirectory } from "./traverse-rdf-library.ts"
import { parseBookFromRdf } from "../queries/parse-book-from-rdf.ts"
import * as Prisma from "../prisma-client/index.js"

const DB_BATCH_SIZE_DEFAULT = 100 // we will store books in DB only every N books

const prisma = new Prisma.PrismaClient()

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
        process.stdout.write(".")
        if (currentBatch.length % 80 === 0) {
            process.stdout.write("\n")
        }
        if (currentBatch.length === DB_BATCH_SIZE_DEFAULT) {
            await saveCurrentBatch()
            currentBatch = []
        }
    }

    console.log(`Starting traversal of Project Gutenberg generated collection in "${collectionPath}"...`)
    await traverseGeneratedCollectionDirectory({ collectionPath, onRdfCallback })
    await saveCurrentBatch()
    console.log("")
}
