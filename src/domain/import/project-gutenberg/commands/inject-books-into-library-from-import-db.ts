import { PrismaClient as ProjectGutenbergImportPrismaClient, RawBook } from "../prisma-client/index.js"
import { PrismaClient as LibraryPrismaClient } from "../../../library/prisma-client/index.js"
import { parseBook } from "../queries/parse-book.ts"
import { Book } from "../../../library/types.ts"

const DB_BATCH_SIZE_DEFAULT = 100 // we will read (and store) books from DB only every N books

const prismaProjectGutenbergImport = new ProjectGutenbergImportPrismaClient()
const prismaLibrary = new LibraryPrismaClient()

type InjectBooksIntoLibraryFromImportDbArgs = {}

export async function injectBooksIntoLibraryFromImportDb({}: InjectBooksIntoLibraryFromImportDbArgs): Promise<void> {
    let currentBatch: Book[] = []

    const saveCurrentBatch = async () => {
        await prismaLibrary.$transaction(
            currentBatch.map((book) => {
                const publicId = `${book.provider}:${book.id}`
                return prismaLibrary.book.upsert({
                    where: {
                        publicId,
                    },
                    update: {},
                    create: {
                        publicId,
                        title: book.title,
                        lang: book.lang,
                    },
                })
            })
        )
    }

    console.log(`Starting injection of Project Gutenberg from import database...`)
    for await (const rawBook of traverseImportDatabase()) {
        const book = parseBook({ bookToParse: rawBook })
        if (!book) {
            continue
        }
        process.stdout.write(".")
        currentBatch.push(book)
        if (currentBatch.length % 80 === 0) {
            process.stdout.write("\n")
        }
        if (currentBatch.length === DB_BATCH_SIZE_DEFAULT) {
            await saveCurrentBatch()
            currentBatch = []
        }
    }
    await saveCurrentBatch()
    console.log("")
}

async function* traverseImportDatabase(): AsyncGenerator<RawBook, void, void> {
    let batchCursor: number = -1
    while (true) {
        // @link https://www.prisma.io/docs/concepts/components/prisma-client/pagination
        const batchContent = await prismaProjectGutenbergImport.rawBook.findMany({
            take: DB_BATCH_SIZE_DEFAULT,
            orderBy: {
                pgBookId: "asc",
            },
            ...(batchCursor === -1 ? {} : { skip: 1, cursor: { pgBookId: batchCursor } }),
        })

        for (const row of batchContent) {
            yield row
        }

        if (batchContent.length > 0) {
            batchCursor = batchContent[batchContent.length - 1].pgBookId
        }

        if (batchContent.length < DB_BATCH_SIZE_DEFAULT) {
            // That was our last batch!
            break
        }
    }
}
