import * as asap from "asap";
import * as coreDomain from "../domain/core";
import * as queriesDomain from "../domain/queries";
import { books as booksFixtures } from "./fixtures";

export class BooksRepository implements queriesDomain.BooksRepository {
  public getBooks(
    pagination: queriesDomain.PaginationRequestData
  ): Promise<coreDomain.BooksById> {
    return new Promise((resolve, reject) => {
      const booksById = getBooksByIdFromBooksArray(booksFixtures);
      asap(() => resolve(booksById));
    });
  }

  public getBookById(id: string): Promise<coreDomain.Book | null> {
    throw new Error("Method not implemented.");
  }
}

function getBooksByIdFromBooksArray(
  books: coreDomain.Book[]
): coreDomain.BooksById {
  const booksById: { [uuid: string]: coreDomain.Book } = {};
  for (const book of books) {
    booksById[book.id] = book;
  }

  return booksById;
}
