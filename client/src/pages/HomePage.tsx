import * as React from "react";
import { FeaturedBooksContainer } from "../hoc/Book/FeaturedBooksContainer";

export function HomePage() {
  return (
    <section className="box">
      <h1>HomePage</h1>
      <FeaturedBooksContainer />
    </section>
  );
}
