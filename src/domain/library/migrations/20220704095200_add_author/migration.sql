-- CreateTable
CREATE TABLE "author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "public_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "birth_year" INTEGER,
    "death_year" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "authors_books" (
    "author_public_id" TEXT NOT NULL,
    "book_public_id" TEXT NOT NULL,

    PRIMARY KEY ("author_public_id", "book_public_id"),
    CONSTRAINT "authors_books_book_public_id_fkey" FOREIGN KEY ("book_public_id") REFERENCES "book" ("public_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "authors_books_author_public_id_fkey" FOREIGN KEY ("author_public_id") REFERENCES "author" ("public_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "author_public_id_key" ON "author"("public_id");
