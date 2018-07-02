import * as React from "react";
import { RouteComponentProps } from "react-router";
import { HigherOrderComponentToolboxContext } from "../contexts/hoc-toolbox";
import { BookFullContainer } from "../hoc/Book/BookFullContainer";
import { HigherOrderComponentToolbox } from "../hoc/HigherOrderComponentToolbox";

export function BookPage(routeProps: RouteComponentProps<{ bookId: string }>): JSX.Element {
  return (
    <section>
      <HigherOrderComponentToolboxContext.Consumer>
        {(hocToolbox: HigherOrderComponentToolbox) => (
          <BookFullContainer bookId={routeProps.match.params.bookId} hocToolbox={hocToolbox} />
        )}
      </HigherOrderComponentToolboxContext.Consumer>
    </section>
  );
}
