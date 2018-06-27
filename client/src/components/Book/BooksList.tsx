import * as React from "react";
import * as ReactPaginate from "react-paginate";
import { Redirect } from "react-router-dom";
import { Book, BooksById } from "../../domain/core";
import { PaginationResponseData } from "../../domain/queries";
import { BookListItem } from "./BookListItem";

export interface BooksListProps {
  books: BooksById;
  baseUrlWithoutPagination?: string;
  pagination?: PaginationResponseData;
}

interface BooksListState {
  goToPage: number | null;
}

export class BooksList extends React.Component<BooksListProps, BooksListState> {
  constructor(props: BooksListProps) {
    super(props);
    this.state = { goToPage: null };
  }

  public render() {
    if (this.state.goToPage) {
      return (
        <Redirect
          push={true}
          to={{
            pathname: this.props.baseUrlWithoutPagination,
            search: `?page=${this.state.goToPage}`,
          }}
        />
      );
    }
    const componentOnPageChange = (pageObject: { selected: number }) => {
      const targetPageNum = pageObject.selected + 1;
      this.setState({ goToPage: targetPageNum });
    };

    const pageCount = this.props.pagination
      ? Math.ceil(this.props.pagination.nbResultsTotal / this.props.pagination.nbPerPage)
      : 1;
    const pageIndex = this.props.pagination ? this.props.pagination.page - 1 : 0;

    return (
      <>
        <div className="columns books-list is-multiline">
          {Object.values(this.props.books).map((book: Book) => {
            return <BookListItem book={book} key={book.id} />;
          })}
        </div>
        {this.props.pagination ? (
          <div className="pagination">
            <ReactPaginate
              pageCount={pageCount}
              pageRangeDisplayed={pageIndex}
              initialPage={pageIndex}
              marginPagesDisplayed={5}
              onPageChange={componentOnPageChange}
              disableInitialCallback={true}
            />
          </div>
        ) : (
          ""
        )}
      </>
    );
  }
}
