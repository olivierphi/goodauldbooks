import { open, readFile, stat } from "fs";
import { promisify } from "util";
import { parseString as parseXmlString } from "xml2js";

export const fs = {
  openAsync: promisify(open),
  readFileAsync: promisify(readFile),
  statAsync: promisify(stat),
};

export const xml = {
  // (don't know why TypeScript does wrong assertions on that type... I have to cast it with "as" :-/)
  parseXmlStringAsync: promisify(parseXmlString) as (xml: string) => Promise<{}>,
};
