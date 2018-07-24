import * as React from "react";
import { Link } from "react-router-dom";
import { Author, Book, LANG_ALL } from "../../domain/core";
import { BreadcrumbData, Page } from "../../domain/pages";
import {
  getAuthorPageUrl,
  getBookPageUrl,
  getBooksByLangPageUrl,
  getGenrePageUrl,
} from "../../utils/routing-utils";

interface BreadcrumbProps {
  currentLang: string;
  currentBreadcrumb: BreadcrumbData;
}

interface BreadcrumbPart {
  label: string;
  url?: string | null;
}

// TODO: i18n
export class Breadcrumb extends React.Component<BreadcrumbProps> {
  private breadcrumbParts: BreadcrumbPart[] = [];

  public render() {
    this.setBreadcumbParts();
    const nbBreadcrumbParts = this.breadcrumbParts.length;

    return (
      <div id="breadcrumb">
        {this.breadcrumbParts.map((part: BreadcrumbPart, i: number) => {
          return (
            <span key={part.label}>
              {part.url ? (
                <Link to={part.url} className="item" key={part.label}>
                  {part.label}
                </Link>
              ) : (
                <span className="item" key={part.label}>
                  {part.label}
                </span>
              )}
              {i < nbBreadcrumbParts - 1 ? <span className="separator">&gt;</span> : ""}
            </span>
          );
        })}
      </div>
    );
  }

  private setBreadcumbParts(): void {
    const langToUse = this.props.currentBreadcrumb.currentBook
      ? this.props.currentBreadcrumb.currentBook.lang
      : this.props.currentLang;

    this.breadcrumbParts = [
      {
        label: "Homepage",
        url: "/",
      },
      {
        label: "Library",
      },
      {
        label:
          langToUse === LANG_ALL ? "Books for all languages" : `Books for language "${langToUse}"`,
        url: langToUse === LANG_ALL ? null : getBooksByLangPageUrl(langToUse),
      },
    ];

    switch (this.props.currentBreadcrumb.currentPage) {
      case Page.BOOK:
        const book = this.props.currentBreadcrumb.currentBook as Book;
        this.breadcrumbParts.push(...this.getBookRelatedPageBreadcrumbParts(book));
        break;

      case Page.AUTHOR:
        const author = this.props.currentBreadcrumb.currentAuthor as Author;
        this.breadcrumbParts.push(...this.getAuthorRelatedPageBreadcrumbParts(author));
        break;

      case Page.GENRE:
        const genre = this.props.currentBreadcrumb.currentGenre as string;
        this.breadcrumbParts.push(...this.getGenreRelatedPageBreadcrumbParts(genre));
        break;

      case Page.LANG:
        // Nothing to add for the "books by lang" page :-)
        break;
    }
  }

  private getBookRelatedPageBreadcrumbParts(book: Book): BreadcrumbPart[] {
    const breadcrumbParts: BreadcrumbPart[] = [
      ...this.getAuthorRelatedPageBreadcrumbParts(book.author),
      {
        label: "Book",
      },
      {
        label: book.title,
        url: getBookPageUrl(
          this.props.currentLang,
          book.lang,
          book.author.slug,
          book.slug,
          book.id
        ),
      },
    ];

    return breadcrumbParts;
  }

  private getAuthorRelatedPageBreadcrumbParts(author: Author): BreadcrumbPart[] {
    const breadcrumbParts: BreadcrumbPart[] = [
      {
        label: "Books by author",
      },
      {
        label: `${author.firstName} ${author.lastName}`,
        url: getAuthorPageUrl(this.props.currentLang, author.slug, author.id),
      },
    ];

    return breadcrumbParts;
  }

  private getGenreRelatedPageBreadcrumbParts(genre: string): BreadcrumbPart[] {
    const breadcrumbParts: BreadcrumbPart[] = [
      {
        label: "Books by genre",
      },
      {
        label: genre,
        url: getGenrePageUrl(this.props.currentLang, genre),
      },
    ];

    return breadcrumbParts;
  }
}
