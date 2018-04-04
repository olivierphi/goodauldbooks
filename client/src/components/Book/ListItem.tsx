import * as React from "react";
import { Link } from "react-router-dom";
import { Book, Genre, Lang } from "../../domain/core";

export interface ListItemProps {
  book: Book;
  currentLang: Lang;
}

export function ListItem(props: ListItemProps) {
  const book = props.book;

  return (
    <div className="card mb-4 box-shadow">
      <div className="card-header">{book.title.get(props.currentLang)}</div>
      <div className="card-body">
        <h5 className="card-title">
          <Link to={`/books/${book.id}`}>
            {book.title.get(props.currentLang)}
          </Link>
        </h5>
        <p className="card-text">
          {book.genres.map((genre: Genre) => genre.name.get(props.currentLang))}
        </p>
      </div>
    </div>
  );
}
