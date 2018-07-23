import * as React from "react";
import { Link } from "react-router-dom";
import { Author, Book, LANG_ALL } from "../../domain/core";
import { BreadcrumbData, Page } from "../../domain/pages";
import { getAuthorPageUrl, getBookPageUrl, getGenrePageUrl } from "../../utils/routing-utils";

interface BreadcrumbProps {
  currentLang: string;
  currentBreadcrumb: BreadcrumbData;
}

interface BreadcrumbPart {
  label: string;
  url?: string;
}

// TODO: i18n
export class Breadcrumb extends React.Component<BreadcrumbProps> {
  private breadcrumbParts: BreadcrumbPart[] = [];

  public render() {
    this.setBreadcumbParts();
    const nbBreadcrumbParts = this.breadcrumbParts.length;

    return (
      <div id="breadcrumb">
        {this.breadcrumbParts.map((part: BreadcrumbPart, i) => {
          return (
            <>
              {part.url ? (
                <Link to={part.url} className="item" key={i}>
                  {part.label}
                </Link>
              ) : (
                <span className="item">{part.label}</span>
              )}
              {i < nbBreadcrumbParts - 1 ? <span className="separator">&gt;</span> : ""}
            </>
          );
        })}
      </div>
    );
  }

  private setBreadcumbParts(): void {
    this.breadcrumbParts = [
      {
        label: "Homepage",
        url: "/",
      },
    ];

    this.breadcrumbParts.push({
      label: "Library",
    });
    this.breadcrumbParts.push({
      label:
        this.props.currentLang === LANG_ALL
          ? "Books for all languages"
          : `Books for language "${this.props.currentLang}"`,
    });

    switch (this.props.currentBreadcrumb.currentPage) {
      case Page.BOOK:
        const book = this.props.currentBreadcrumb.currentBook as Book;
        this.breadcrumbParts.push({
          label: "Book",
        });
        this.breadcrumbParts.push({
          label: book.title,
          url: getBookPageUrl(
            this.props.currentLang,
            book.lang,
            book.author.slug,
            book.slug,
            book.id
          ),
        });
        break;

      case Page.AUTHOR:
        const author = this.props.currentBreadcrumb.currentAuthor as Author;
        this.breadcrumbParts.push({
          label: "Books by author",
        });
        this.breadcrumbParts.push({
          label: `${author.firstName} ${author.lastName}`,
          url: getAuthorPageUrl(this.props.currentLang, author.slug, author.id),
        });
        break;

      case Page.GENRE:
        const genre = this.props.currentBreadcrumb.currentGenre as string;
        this.breadcrumbParts.push({
          label: "Books by genre",
        });
        this.breadcrumbParts.push({
          label: genre,
          url: getGenrePageUrl(this.props.currentLang, genre),
        });
        break;
    }
  }
}
