-- CreateTable
CREATE TABLE "raw_book" (
    "pg_book_id" INTEGER NOT NULL PRIMARY KEY,
    "rdf_content" TEXT NOT NULL,
    "assets" TEXT NOT NULL,
    "has_intro" BOOLEAN NOT NULL,
    "intro" TEXT,
    "has_cover" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
