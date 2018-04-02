import * as React from "react";

export interface HelloProps { compiler: string; framework: string; }

export const Hello = (props: HelloProps) => {
    const compiler = props.compiler.toUpperCase();
    return <h1>Hello from {compiler} and {props.framework}?</h1>
};
