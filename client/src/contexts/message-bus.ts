import * as EventEmitter from "eventemitter3";
import * as React from "react";

export const MessageBusContext = React.createContext<EventEmitter>(new EventEmitter());
