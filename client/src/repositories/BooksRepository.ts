import * as asap from "asap";
import * as domain from "../domain";
import * as repositoriesDomain from "./api";
import { Books as BooksFixtures } from "./fixtures";

export class BooksRepository implements repositoriesDomain.BooksRepository {
  public getBooks(
    pagination: repositoriesDomain.PaginationRequestData
  ): Promise<domain.BooksById> {
    return new Promise((resolve, reject) => {
      const booksById: { [uuid: string]: domain.Book } = {};
      for (const book of BooksFixtures) {
        booksById[book.id] = book;
      }
      asap(() => resolve(booksById));
    });
  }

  public getBookByUuid(uuid: string): Promise<domain.Book | null> {
    throw new Error("Method not implemented.");
  }
}
