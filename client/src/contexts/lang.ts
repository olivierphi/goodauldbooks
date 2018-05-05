import * as React from "react";
import { Lang } from "../domain/core";

export const CurrentLangContext = React.createContext<string>(Lang.EN);
