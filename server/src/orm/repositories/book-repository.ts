import { EntityManager, EntityRepository } from "typeorm";
import { Book } from "../entities/book";

const DEFAULT_FUZZY_SEARCH_SIMILARITY = 0.2;

@EntityRepository(Book)
export class BookRepository {
  constructor(private manager: EntityManager) {}

  public async searchBooks(pattern: string, similarity?: number): Promise<Book[]> {
    if (!similarity) {
      similarity = DEFAULT_FUZZY_SEARCH_SIMILARITY;
    }
    if (isNaN(similarity)) {
      return Promise.reject(`Invalid similarity ${similarity}`);
    }

    const query = `
      SELECT id, title, similarity(fulltext_content, $1) AS relevance FROM book
      WHERE similarity(fulltext_content, $1) > ${similarity}
      ORDER BY fulltext_content <-> $1
      `;
    const matchingBooks = await this.manager.query(query, [pattern]);
    console.log(matchingBooks);
    return matchingBooks;
  }
}
