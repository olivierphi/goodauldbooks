import * as React from "react";
import { Link } from "react-router-dom";
import { OmnipotentComponentToolkitContext } from "../../contexts/omnipotent-component-toolkit";
import { AutocompleteSearchContainer } from "../../hoc/AutocompleteSearchContainer";
import { BooksLangsSelectorContainer } from "../../hoc/Misc/BooksLangsSelectorContainer";
import { OmniponentComponentToolkit } from "../../hoc/OmnipotentComponentToolkit";

export function Banner() {
  return (
    <section id="banner">
      <h1>
        <Link to={`/`}>Good Auld Books</Link>
      </h1>
      <p>Find a book amongst a collection of 60.000 by using the search field below</p>
      <div className="search-container">
        <OmnipotentComponentToolkitContext.Consumer>
          {(omnipotentToolkit: OmniponentComponentToolkit) => (
            <>
              <AutocompleteSearchContainer hocToolkit={omnipotentToolkit} />
              <BooksLangsSelectorContainer hocToolkit={omnipotentToolkit} />
            </>
          )}
        </OmnipotentComponentToolkitContext.Consumer>
      </div>
    </section>
  );
}
