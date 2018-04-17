import { EntityRepository, Repository } from "typeorm";
import { formatStringForBookFullTextContent } from "../../utils/book-utils";
import { Book } from "../entities/book";

const DEFAULT_FUZZY_SEARCH_SIMILARITY = 0.2;

@EntityRepository(Book)
export class BookRepository extends Repository<Book> {
  public async searchBooks(pattern: string, similarity?: number): Promise<Book[]> {
    if (!similarity) {
      similarity = DEFAULT_FUZZY_SEARCH_SIMILARITY;
    }
    if (isNaN(similarity)) {
      return Promise.reject(new Error(`Invalid similarity ${similarity}`));
    }

    const normalisedPattern = formatStringForBookFullTextContent(pattern);

    const query = `
      SELECT id, title, similarity(fulltext_content, $1) AS relevance FROM book
      WHERE similarity(fulltext_content, $1) > ${similarity}
      ORDER BY fulltext_content <-> $1
      `;
    const matchingBooks = await this.manager.query(query, [normalisedPattern]);
    console.log(matchingBooks);
    return matchingBooks;
  }
}
