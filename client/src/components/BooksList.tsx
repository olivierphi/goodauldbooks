import * as React from "react";
import { Link } from "react-router-dom";
import { CurrentLangContext } from "../contexts/lang";
import { Book, BooksById, Genre } from "../domain/core";
import { PaginationRequestData } from "../domain/queries";

export interface BooksListProps {
  books: BooksById;
  fetchBooksList: (pagination: PaginationRequestData) => void;
}

export const BooksList = (props: BooksListProps) => {
  const booksList: Book[] = Object.values(props.books);

  if (!booksList.length) {
    props.fetchBooksList({ page: 1, nbPerPage: 10 });
    return <div className="loading">Loading books...</div>;
  }

  return (
    <CurrentLangContext.Consumer>
      {(currentLang: string) => (
        <div className="row books-list">
          <div className="card-deck">
            {booksList.map((book: Book) => {
              return (
                <div className="card mb-4 box-shadow" key={book.id}>
                  <div className="card-header">Last releases</div>
                  <div className="card-body">
                    <h5 className="card-title">
                      <Link to={`/books/${book.id}`}>
                        {book.title[currentLang]}
                      </Link>
                    </h5>
                    <p className="card-text">
                      {book.genres.map(
                        (genre: Genre) => genre.name[currentLang]
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </CurrentLangContext.Consumer>
  );
};
