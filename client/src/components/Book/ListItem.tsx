import * as React from "react";
import { Link } from "react-router-dom";
import { AssetsConfigContext } from "../../contexts/assets-config";
import { Book, Lang } from "../../domain/core";
import { AssetsConfig } from "../../domain/web";

export interface ListItemProps {
  book: Book;
  currentLang: Lang;
}

export function ListItem(props: ListItemProps) {
  const book = props.book;

  return (
    <AssetsConfigContext.Consumer>
      {(assetsConfig: AssetsConfig) => (
        <div className="card mb-4 box-shadow">
          <div className="card-header">
            {book.cover ? <img src={`${assetsConfig.coversBaseUrl}${book.cover}`} /> : book.title}
          </div>
          <div className="card-body">
            <h5 className="card-title">
              <Link to={`/books/${book.id}`}>{book.title}</Link>
            </h5>
            <p className="card-text">{book.genres.join(", ")}</p>
          </div>
        </div>
      )}
    </AssetsConfigContext.Consumer>
  );
}
