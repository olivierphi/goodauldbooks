import * as React from "react";
import { BookIntro } from "../../components/Book/BookIntro";
import { OmniponentComponentToolbox } from "../OmnipotentComponentToolbox";

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
  hocToolbox: OmniponentComponentToolbox;
}

export interface BookIntroContainerState {
  loading: false;
  bookIntro: string | null;
}

interface BookIntroContainerLoadingState {
  loading: true;
}

export class BookIntroContainer extends React.Component<
  BookIntroContainerProps,
  BookIntroContainerState | BookIntroContainerLoadingState
> {
  public constructor(props: BookIntroContainerProps) {
    super(props);
    this.state = this.getDerivedStateFromPropsAndAppState();
  }

  public render() {
    if (this.state.loading) {
      this.fetchData();
      return <div className="book-intro loading">Loading...</div>;
    }

    return <BookIntro bookId={this.props.bookId} bookIntro={this.state.bookIntro} />;
  }

  private fetchData(): void {
    this.loadBookIntro(this.props.bookId);
  }

  private getDerivedStateFromPropsAndAppState():
    | BookIntroContainerState
    | BookIntroContainerLoadingState {
    if (!booksIntrosCache[this.props.bookId]) {
      return { loading: true };
    }

    return { loading: false, bookIntro: booksIntrosCache[this.props.bookId] };
  }

  private async loadBookIntro(bookId: string): Promise<null> {
    const bookIntro = await this.props.hocToolbox.servicesLocator.booksRepository.getBookIntro(
      bookId
    );
    booksIntrosCache[bookId] = bookIntro;
    this.setState({ loading: false, bookIntro });
    return Promise.resolve(null);
  }
}
