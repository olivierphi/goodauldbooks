import { open, readdir, readFile, stat } from "fs";
import { promisify } from "util";

export const fs = {
  openAsync: promisify(open),
  readFileAsync: promisify(readFile),
  statAsync: promisify(stat),
  readdirAsync: promisify(readdir),
};
