import * as React from "react";
import { Link } from "react-router-dom";
import { OmnipotentComponentToolboxContext } from "../../contexts/omnipotent-component-toolbox";
import { AutocompleteSearchContainer } from "../../hoc/AutocompleteSearchContainer";
import { BooksLangsSelectorContainer } from "../../hoc/Misc/BooksLangsSelectorContainer";
import { OmniponentComponentToolbox } from "../../hoc/OmnipotentComponentToolbox";

export function Banner() {
  return (
    <section id="banner">
      <h1>
        <Link to={`/`}>Good Auld Books</Link>
      </h1>
      <p>Find a book amongst a collection of 60.000 by using the search field below</p>
      <div className="search-container">
        <OmnipotentComponentToolboxContext.Consumer>
          {(omnipotentToolbox: OmniponentComponentToolbox) => (
            <>
              <AutocompleteSearchContainer hocToolbox={omnipotentToolbox} />
              <BooksLangsSelectorContainer hocToolbox={omnipotentToolbox} />
            </>
          )}
        </OmnipotentComponentToolboxContext.Consumer>
      </div>
    </section>
  );
}
