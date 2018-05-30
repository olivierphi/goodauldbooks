import * as React from "react";

export interface BookIntroProps {
  bookId: string;
  bookIntro: string | null;
}

export function BookIntro(props: BookIntroProps) {
  if (!props.bookIntro) {
    return <div className="book-intro no-intro">[no intro]</div>;
  }

  return <div className="book-intro">{props.bookIntro}...</div>;
}
