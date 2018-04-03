import * as React from "react";

export interface HeaderProps {}

export function Header(props: HeaderProps) {
  return (
    <header>
      <div className="navbar navbar-dark bg-dark box-shadow">
        <div className="container d-flex justify-content-between">
          <a href="#" className="navbar-brand d-flex align-items-center">
            <strong>Public Domain books</strong>
          </a>
        </div>
      </div>
    </header>
  );
}
