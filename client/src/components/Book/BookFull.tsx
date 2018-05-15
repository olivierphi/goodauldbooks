import * as React from "react";
import { Link } from "react-router-dom";
import { CurrentLangContext } from "../../contexts/lang";
import { Book, GenreWithStats, Lang } from "../../domain/core";
import { getGenrePageUrl } from "../../utils/routing-utils";

export interface BookFullProps {
  book: Book;
  genresWithStats: GenreWithStats[];
}

export function BookFull(props: BookFullProps) {
  const book = props.book;
  const author = book.author;

  return (
    <CurrentLangContext.Consumer>
      {(currentLang: Lang) => (
        <div className="book-full">
          <h3>{book.title}</h3>
          <ul className="genres">
            {props.genresWithStats.map((genre: GenreWithStats, i) => {
              return (
                <li key={i}>
                  <Link to={getGenrePageUrl(genre.title)}>
                    {genre.title} ({genre.nbBooks} books)
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="author">
            <span className="author-name">
              {author.firstName} {author.lastName}
            </span>
          </p>
        </div>
      )}
    </CurrentLangContext.Consumer>
  );
}
