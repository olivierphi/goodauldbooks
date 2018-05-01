import * as React from "react";
import { Link } from "react-router-dom";

export interface HeaderProps {}

export function Header(props: HeaderProps) {
  return (
    <header>
      <div className="navbar navbar-dark bg-dark box-shadow">
        <div className="container d-flex justify-content-between">
          <Link to={"/"} className="navbar-brand d-flex align-items-center">
            <strong>Public Domain books</strong>
          </Link>
        </div>
      </div>
    </header>
  );
}
