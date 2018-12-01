import React, { useState, SyntheticEvent } from "react";
import logo from "./logo.svg";
import "./App.css";

export default function App() {
  const [counter, setCounter] = useState(0);

  function onCounterIncrementClick(e: SyntheticEvent): void {
    setCounter(counter + 1);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>Counter: {counter}</p>
        <p>
          <a href="#" onClick={onCounterIncrementClick}>
            increment!
          </a>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
