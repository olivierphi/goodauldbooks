import * as debugUtil from "debug";
import * as slug from "slug";
import { EntityManager, ObjectType, Repository, SelectQueryBuilder } from "typeorm";
import { ImportedAuthor, ImportedBook } from "../../domain/import";
import { DbWrappedError } from "../../errors/db-wrapped-error";
import { Author } from "../../orm/entities/author";
import { Book } from "../../orm/entities/book";
import { BookRepository } from "../../orm/repositories/book-repository";
import { container } from "../../services-container";
import { formatStringForBookFullTextContent, generateBookSlug } from "../../utils/book-utils";

const debug = debugUtil("import:db_storage");

export async function storeImportedBookIntoDatabase(importedBook: ImportedBook): Promise<Book> {
  const bookEntity = await saveBookInDatabase(importedBook);

  const importedAuthor = importedBook.author;
  if (importedAuthor && importedAuthor.firstName && importedAuthor.lastName) {
    await saveAuthorInDatabase(importedAuthor, bookEntity);
  }

  return Promise.resolve(bookEntity);
}

async function saveBookInDatabase(importedBook: ImportedBook): Promise<Book> {
  const saveNewBook = async (newBookSlug: string) => {
    bookEntity = new Book();
    bookEntity.title = importedBook.title;
    bookEntity.projetGutenbergId = importedBook.gutenbergId;
    bookEntity.slug = newBookSlug;
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

    return Promise.resolve(bookEntity);
  };

  const bookSlug = generateBookSlug(
    importedBook.title,
    importedBook.author ? importedBook.author.firstName : null,
    importedBook.author ? importedBook.author.lastName : null
  );

  let bookEntity: Book;
  const alreadyExistingBook = await getAlreadyExistingBookEntity(bookSlug);
  if (!alreadyExistingBook) {
    bookEntity = await saveNewBook(bookSlug);
    debug(`Created a new Book with id #${bookEntity.id}`);
  } else {
    bookEntity = alreadyExistingBook;
    debug(`Retrieved an existing Book with id #${bookEntity.id}`);
  }

  return Promise.resolve(bookEntity);
}

async function saveAuthorInDatabase(importedAuthor: ImportedAuthor, book: Book): Promise<Author> {
  const saveNewAuthor = async (author: ImportedAuthor, bookEntity: Book): Promise<Author> => {
    const authorEntity = new Author();
    authorEntity.firstName = author.firstName;
    authorEntity.lastName = author.lastName;
    authorEntity.projetGutenbergId = author.gutenbergId;
    authorEntity.birthYear = author.birthYear;
    authorEntity.deathYear = author.deathYear;
    authorEntity.books = [bookEntity];
    try {
      await getDbManager().save(authorEntity);
    } catch (e) {
      return Promise.reject(
        new DbWrappedError(`Couldn't save new author #${author.gutenbergId} in db`, e)
      );
    }
    debug(`Created a new Author with id #${authorEntity.id}`);

    return Promise.resolve(authorEntity);
  };

  const saveExistingAuthorWithThatBook = async (
    author: Author,
    bookEntity: Book
  ): Promise<Author> => {
    const authorHasThisBook: boolean =
      author.books.filter((b: Book) => b.id === bookEntity.id).length > 0;

    if (!authorHasThisBook) {
      author.books.push(bookEntity);
      try {
        await getDbManager().save(author);
      } catch (e) {
        return Promise.reject(
          new DbWrappedError(`Couldn't save existing author #${author.projetGutenbergId} in db`, e)
        );
      }
      debug(`Added the book to already existing Author with id #${author.id}`);
    }
    return Promise.resolve(author);
  };

  const alreadyExistingAuthor = await getAlreadyExistingAuthorEntity(importedAuthor, {
    fetchBooks: true,
  });
  if (!alreadyExistingAuthor) {
    return saveNewAuthor(importedAuthor, book);
  }

  return saveExistingAuthorWithThatBook(alreadyExistingAuthor, book);
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
