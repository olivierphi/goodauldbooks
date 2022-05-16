-- CreateTable
CREATE TABLE "RawBook" (
    "pgBookId" INTEGER NOT NULL PRIMARY KEY,
    "rdfContent" TEXT NOT NULL,
    "assets" TEXT NOT NULL,
    "hasIntro" BOOLEAN NOT NULL,
    "intro" TEXT,
    "hasCover" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
