import * as React from "react";
import * as ReactPaginate from "react-paginate";
import { Book, BooksById } from "../../domain/core";
import { PaginationResponseData } from "../../domain/queries";
import { BookListItem } from "./BookListItem";

export interface BooksListProps {
  books: BooksById;
  pagination: PaginationResponseData | null;
  navigateToPageNum: ((pageNumber: number) => void) | null;
}

export class BooksList extends React.Component<BooksListProps> {
  public render() {
    const onPageChange = (pageObject: { selected: number }) => {
      const targetPageNum = pageObject.selected + 1;
      this.props.navigateToPageNum && this.props.navigateToPageNum(targetPageNum);
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
              onPageChange={onPageChange}
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
