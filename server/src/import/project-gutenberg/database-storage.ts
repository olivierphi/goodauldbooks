import * as slug from "slug";
import { EntityManager, ObjectType, Repository, SelectQueryBuilder } from "typeorm";
import { ImportedAuthor, ImportedBook } from "../../domain/import";
import { DbWrappedError } from "../../errors/db-wrapped-error";
import { Author } from "../../orm/entities/author";
import { Book } from "../../orm/entities/book";
import { BookRepository } from "../../orm/repositories/book-repository";
import { container } from "../../services-container";
import { formatStringForBookFullTextContent, generateBookSlug } from "../../utils/book-utils";

/**
 * TODO: remove all those `console.log` once we have proper tests and stuff with these functions :-)
 */

export async function storeImportedBookIntoDatabase(importedBook: ImportedBook): Promise<Book> {
  // TODO: split all this in proper smaller methods :-)

  const importedAuthor = importedBook.author;

  const bookSlug = generateBookSlug(
    importedBook.title,
    importedAuthor ? importedAuthor.firstName : null,
    importedAuthor ? importedAuthor.lastName : null
  );

  let bookEntity: Book;
  const alreadyExistingBook = await getAlreadyExistingBookEntity(bookSlug);
  if (!alreadyExistingBook) {
    bookEntity = new Book();
    bookEntity.title = importedBook.title;
    bookEntity.projetGutenbergId = importedBook.gutenbergId;
    bookEntity.slug = bookSlug;
    bookEntity.lang = importedBook.lang;
    bookEntity.genres = importedBook.genres;
    bookEntity.fullTextContent = formatStringForBookFullTextContent(importedBook.title);

    try {
      await getDbManager().save(bookEntity);
    } catch (e) {
      return Promise.reject(
        new DbWrappedError(`Couldn't save new book #${bookEntity.projetGutenbergId} in db`, e)
      );
    }
    console.log(`Created a new Book with id #${bookEntity.id}`);
  } else {
    bookEntity = alreadyExistingBook;
    console.log(`Retrieved an existing Book with id #${bookEntity.id}`);
  }

  if (importedAuthor && importedAuthor.firstName && importedAuthor.lastName) {
    let authorEntity: Author;
    const alreadyExistingAuthor = await getAlreadyExistingAuthorEntity(importedAuthor, {
      fetchBooks: true,
    });
    if (!alreadyExistingAuthor) {
      authorEntity = new Author();
      authorEntity.firstName = importedAuthor.firstName;
      authorEntity.lastName = importedAuthor.lastName;
      authorEntity.projetGutenbergId = importedAuthor.gutenbergId;
      authorEntity.birthYear = importedAuthor.birthYear;
      authorEntity.deathYear = importedAuthor.deathYear;
      authorEntity.books = [bookEntity];
      try {
        await getDbManager().save(authorEntity);
      } catch (e) {
        return Promise.reject(
          new DbWrappedError(`Couldn't save new author #${importedAuthor.gutenbergId} in db`, e)
        );
      }
      console.log(`Created a new Author with id #${authorEntity.id}`);
    } else {
      authorEntity = alreadyExistingAuthor;
      const authorHasThisBook: boolean =
        authorEntity.books.filter((book: Book) => book.id === bookEntity.id).length > 0;
      if (!authorHasThisBook) {
        authorEntity.books.push(bookEntity);
        try {
          await getDbManager().save(authorEntity);
        } catch (e) {
          return Promise.reject(
            new DbWrappedError(
              `Couldn't save existing author #${authorEntity.projetGutenbergId} in db`,
              e
            )
          );
        }
        console.log(`Added the book to already existing Author with id #${authorEntity.id}`);
      }
    }
  }

  return Promise.resolve(bookEntity);
}

function getDbManager(): EntityManager {
  return container.dbConnection.manager;
}

function getRepository<Entity>(entityType: ObjectType<Entity> | string): Repository<Entity> {
  return container.dbConnection.getRepository(entityType);
}

function getBookRepository(): BookRepository {
  return container.dbConnection.getCustomRepository(BookRepository);
}

async function getAlreadyExistingBookEntity(importedBookSlug: string): Promise<Book | undefined> {
  return getBookRepository()
    .createQueryBuilder("book")
    .where("book.slug = :slug", { slug: importedBookSlug })
    .getOne();
}

async function getAlreadyExistingAuthorEntity(
  importedAuthor: ImportedAuthor,
  options: { fetchBooks?: boolean } = {}
): Promise<Author | undefined> {
  let queryBuilder: SelectQueryBuilder<Author>;

  if (importedAuthor.gutenbergId) {
    queryBuilder = getRepository(Author)
      .createQueryBuilder("author")
      .where("author.project_gutenberg_id = :gutenberId", {
        gutenberId: importedAuthor.gutenbergId,
      });
  } else {
    queryBuilder = getRepository(Author)
      .createQueryBuilder("author")
      .where("author.first_name = :firstName", { firstName: importedAuthor.firstName })
      .andWhere("author.last_name = :lastName", { lastName: importedAuthor.lastName })
      .andWhere("author.birth_year = :birthYear", { birthYear: importedAuthor.birthYear })
      .andWhere("author.death_year = :deathYear", { deathYear: importedAuthor.deathYear });
  }

  if (options.fetchBooks) {
    queryBuilder.leftJoinAndSelect("author.books", "book");
  }

  return queryBuilder.getOne();
}
