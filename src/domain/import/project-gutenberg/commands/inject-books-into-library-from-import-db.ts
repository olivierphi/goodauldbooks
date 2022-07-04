import { PrismaClient as LibraryPrismaClient, PrismaPromise } from "../../../library/prisma-client/index.js"
import { Author, Book } from "../../../library/types.ts"
import { PrismaClient as ProjectGutenbergImportPrismaClient, RawBook } from "../prisma-client/index.js"
import { parseBook } from "../queries/parse-book.ts"

const DB_BATCH_SIZE_DEFAULT = 100 // we will read (and store) books from DB only every N books

const prismaProjectGutenbergImport = new ProjectGutenbergImportPrismaClient()
const prismaLibrary = new LibraryPrismaClient()

type InjectBooksIntoLibraryFromImportDbArgs = {
    onParsedBookCallback?: (book: Book) => void
}

export async function injectBooksIntoLibraryFromImportDb({
    onParsedBookCallback,
}: InjectBooksIntoLibraryFromImportDbArgs): Promise<void> {
    let currentBatch: Book[] = []

    const saveCurrentBatch = async () => {
        const prismaPromises: PrismaPromise<any>[] = []
        for (const book of currentBatch) {
            // Upsert authors:
            prismaPromises.push(
                ...book.authors.map((author: Author) => {
                    return prismaLibrary.author.upsert({
                        where: { publicId: author.publicId },
                        update: {},
                        create: {
                            publicId: author.publicId,
                            firstName: author.firstName,
                            lastName: author.lastName,
                            birthYear: author.birthYear,
                            deathYear: author.deathYear,
                        },
                    })
                })
            )
            // Upsert Book:
            prismaPromises.push(
                prismaLibrary.book.upsert({
                    where: {
                        publicId: book.publicId,
                    },
                    update: {},
                    create: {
                        publicId: book.publicId,
                        title: book.title,
                        lang: book.lang,
                    },
                })
            )
            // Upsert Authors<->Book relations:
            prismaPromises.push(
                ...book.authors.map((author: Author) => {
                    return prismaLibrary.authorBooks.upsert({
                        where: {
                            authorPublicId_bookPublicId: {
                                bookPublicId: book.publicId,
                                authorPublicId: author.publicId,
                            },
                        },
                        update: {},
                        create: {
                            bookPublicId: book.publicId,
                            authorPublicId: author.publicId,
                        },
                    })
                })
            )
        }

        await prismaLibrary.$transaction(prismaPromises)
    }

    console.log(`Starting injection of Project Gutenberg from import database...`)
    for await (const rawBook of traverseImportDatabase()) {
        const book = parseBook({ bookToParse: rawBook })
        if (!book) {
            continue
        }
        onParsedBookCallback?.(book)
        currentBatch.push(book)
        if (currentBatch.length === DB_BATCH_SIZE_DEFAULT) {
            await saveCurrentBatch()
            currentBatch = []
        }
    }
    await saveCurrentBatch()
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
