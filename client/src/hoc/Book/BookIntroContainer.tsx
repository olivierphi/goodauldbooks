import * as React from "react";
import { BookIntro } from "../../components/Book/BookIntro";
import { EVENTS } from "../../domain/messages";
import { HigherOrderComponentToolkit } from "../HigherOrderComponentToolkit";

export interface BookIntroContainerProps {
  bookId: string;
  hocToolkit: HigherOrderComponentToolkit;
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
    this.state = { loading: true };
    this.onBookIntroFetched = this.onBookIntroFetched.bind(this);
  }

  public render() {
    if (this.state.loading) {
      this.fetchData();
      return <div className="book-intro loading">Loading...</div>;
    }

    return <BookIntro bookId={this.props.bookId} bookIntro={this.state.bookIntro} />;
  }

  public componentWillUnmount(): void {
    this.props.hocToolkit.messageBus.off(EVENTS.BOOK_INTRO_FETCHED, this.onBookIntroFetched);
  }

  private fetchData(): void {
    this.props.hocToolkit.messageBus.on(EVENTS.BOOK_INTRO_FETCHED, this.onBookIntroFetched);
    this.props.hocToolkit.actionsDispatcher.fetchIntroForBook(this.props.bookId);
  }

  private onBookIntroFetched(bookIntro: string | null) {
    this.setState({
      loading: false,
      bookIntro,
    });
  }
}
