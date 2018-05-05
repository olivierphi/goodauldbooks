import * as React from "react";
import { AssetsConfig } from "../domain/web";

export const AssetsConfigContext = React.createContext<AssetsConfig | null>(null);
