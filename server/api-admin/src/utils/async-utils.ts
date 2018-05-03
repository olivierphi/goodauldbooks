import * as fsBase from "fs";
import { promisify } from "util";

export const fs = {
  openAsync: promisify(fsBase.open),
  readAsync: promisify(fsBase.read),
  closeAsync: promisify(fsBase.close),
  readFileAsync: promisify(fsBase.readFile),
  statAsync: promisify(fsBase.stat),
  readdirAsync: promisify(fsBase.readdir),
};
