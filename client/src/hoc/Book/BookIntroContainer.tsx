import * as React from "react";
import { BookIntro } from "../../components/Book/BookIntro";
import { container } from "../../ServicesContainer";

/**
 * We don't store the books intros in the global app state, as they
 * are quite heavy and we want to keep this state lightweight for serialisation.
 *
 * We do store an internal cache for this data, though.
 */
interface BookIntrosCache {
  [bookId: string]: string | null;
}

const booksIntrosCache: BookIntrosCache = {};

export interface BookIntroContainerProps {
  bookId: string;
}

export interface BookIntroContainerState {
  bookIntro: string | null | undefined;
}

export class BookIntroContainer extends React.Component<
  BookIntroContainerProps,
  BookIntroContainerState
> {
  public constructor(props: BookIntroContainerProps) {
    super(props);
    this.state = {
      bookIntro: booksIntrosCache[props.bookId],
    };
  }

  public render() {
    if (this.state.bookIntro === undefined) {
      this.loadBookIntro(this.props.bookId);
      return <div className="book-intro loading">Loading...</div>;
    }

    return <BookIntro bookId={this.props.bookId} bookIntro={this.state.bookIntro} />;
  }

  private async loadBookIntro(bookId: string): Promise<null> {
    const bookIntro = await container.booksRepository.getBookIntro(bookId);
    booksIntrosCache[bookId] = bookIntro;
    this.setState({ bookIntro });
    return Promise.resolve(null);
  }
}
