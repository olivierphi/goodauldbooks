import { ImportedBook } from "../domain/import";
import { Book } from "../orm/entities/book";
import { container } from "../services-container";

export async function storeImportedBookIntoDatabase(importedBookData: ImportedBook): Promise<Book> {
  const bookEntity = new Book();
  bookEntity.title = Object.values(importedBookData.title)[0];
  bookEntity.slug = bookEntity.title.toLowerCase();
  await container.dbConnection.manager.save(bookEntity);
  console.log(`Saved a new Book with id #${bookEntity.id}`);

  console.log(`Nb books in database: ${await container.dbConnection.getRepository(Book).count()}`);

  return bookEntity;
}
