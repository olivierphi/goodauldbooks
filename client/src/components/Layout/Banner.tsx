import * as React from "react";
import { Link } from "react-router-dom";
import { AutocompleteSearchContainer } from "../../hoc/AutocompleteSearchContainer";

export function Banner() {
  return (
    <section id="banner">
      <h1>
        <Link to={`/`}>Good Auld Books</Link>
      </h1>
      <p>Find a book amongst a collection of 60.000 by using the search field below</p>
      <div className="search-container">
        <AutocompleteSearchContainer />
      </div>
    </section>
  );
}
