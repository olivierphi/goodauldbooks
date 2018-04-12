import { EntityManager, ObjectType, Repository } from "typeorm";
import { ImportedAuthor, ImportedBook } from "../domain/import";
import { Author } from "../orm/entities/author";
import { Book } from "../orm/entities/book";
import { container } from "../services-container";
import { generateBookSlug } from "../utils/book-utils";

export async function storeImportedBookIntoDatabase(importedBook: ImportedBook): Promise<Book> {
  const bookTitleStr = Object.values(importedBook.title)[0];
  const importedAuthor = importedBook.author;

  const bookSlug = generateBookSlug(
    bookTitleStr,
    importedAuthor.firstName,
    importedAuthor.lastName
  );

  let bookEntity: Book;
  const alreadyExistingBook = await getAlreadyExistingBookEntity(bookSlug);
  if (!alreadyExistingBook) {
    bookEntity = new Book();
    bookEntity.title = bookTitleStr;
    bookEntity.slug = bookSlug;
    console.log(bookEntity);
    await getDbManager().save(bookEntity);
    console.log(`Created a new Book with id #${bookEntity.id}`);
  } else {
    bookEntity = alreadyExistingBook;
    console.log(`Retrieved an existing Book with id #${bookEntity.id}`);
  }

  let authorEntity: Author;
  const alreadyExistingAuthor = await getAlreadyExistingAuthorEntity(importedAuthor);
  if (!alreadyExistingAuthor) {
    authorEntity = new Author();
    authorEntity.firstName = importedAuthor.firstName;
    authorEntity.lastName = importedAuthor.lastName;
    authorEntity.birthYear = importedAuthor.birthYear;
    authorEntity.deathYear = importedAuthor.deathYear;
    authorEntity.books = [bookEntity];
    await getDbManager().save(authorEntity);
    console.log(`Created a new Author with id #${authorEntity.id}`);
  } else {
    authorEntity = alreadyExistingAuthor;
    authorEntity.books.push(bookEntity);
    await getDbManager().save(authorEntity);
    console.log(`Updated an existing Author with id #${authorEntity.id}`);
  }

  console.log(`Nb books in database: ${await getRepository(Book).count()}`);
  console.log(`Nb authors in database: ${await getRepository(Author).count()}`);

  return bookEntity;
}

function getDbManager(): EntityManager {
  return container.dbConnection.manager;
}

function getRepository<Entity>(entityType: ObjectType<Entity> | string): Repository<Entity> {
  return container.dbConnection.getRepository(entityType);
}

async function getAlreadyExistingBookEntity(importedBookSlug: string): Promise<Book | undefined> {
  return getRepository(Book)
    .createQueryBuilder("book")
    .where("book.slug = :slug", { slug: importedBookSlug })
    .getOne();
}

async function getAlreadyExistingAuthorEntity(
  importedAuthor: ImportedAuthor
): Promise<Author | undefined> {
  return getRepository(Author)
    .createQueryBuilder("author")
    .where("author.firstName = :firstName", { firstName: importedAuthor.firstName })
    .andWhere("author.lastName = :lastName", { lastName: importedAuthor.lastName })
    .andWhere("author.birthYear = :birthYear", { birthYear: importedAuthor.birthYear })
    .andWhere("author.deathYear = :deathYear", { birthYear: importedAuthor.deathYear })
    .getOne();
}
