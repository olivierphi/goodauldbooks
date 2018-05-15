import * as React from "react";
import { RouteComponentProps } from "react-router";

export function AuthorPage(routeProps: RouteComponentProps<{ authorId: string }>): JSX.Element {
  return (
    <section className="box">
      <p>TODO: author page</p>
      (author {routeProps.match.params.authorId})
    </section>
  );
}
