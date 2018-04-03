import * as React from "react";
import { Link } from "react-router-dom";
import { Main } from "../components/Main";

export function HomePage() {
  return (
    <>
      <h1>HomePage</h1>
      <Link to="/book/123">go to book</Link>
      <Main />
    </>
  );
}
