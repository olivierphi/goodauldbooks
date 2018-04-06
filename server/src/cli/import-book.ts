#!/usr/bin/env node

import * as yargs from "yargs";
import {
  downloadEbookGeneratedCollectionContent,
  downloadEbookMainCollectionContent,
} from "../import/book-import";

interface Args {
  bookId: number;
  path: string;
  mcMirrorUrl: string;
  mcMirrorModule?: string;
  gcMirrorUrl: string;
  gcMirrorModule?: string;
}

const argv: any = yargs
  .option("id", {
    alias: "bookId",
    describe: "Project Gutenberg book id",
    demandOption: true,
    type: "number",
  })
  .option("p", {
    alias: "path",
    describe: "target local folder path",
    demandOption: true,
  })
  .option("mcurl", {
    alias: "mcMirrorUrl",
    describe: "Project Gutenberg  'main collection' RSync mirror URL",
    demandOption: true,
  })
  .option("mcmod", {
    alias: "mcMirrorModule",
    describe: "Project Gutenberg 'main collection' RSync mirror module",
  })
  .option("gcurl", {
    alias: "gcMirrorUrl",
    describe: "Project Gutenberg 'generated collection' RSync mirror URL",
    demandOption: true,
  })
  .option("gcmod", {
    alias: "gcMirrorModule",
    describe: "Project Gutenberg 'generated collection' RSync mirror module",
  })
  .help().argv;

importBook(argv);

async function importBook(input: Args) {
  return Promise.all([
    processDownloadEbookMainCollectionContentStep(input),
    processDownloadEbookGeneratedCollectionContentStep(input),
  ]);
}

async function processDownloadEbookMainCollectionContentStep(input: Args) {
  const stepName = "[main collection]";
  const stepStartTime = reportStepStart(
    stepName,
    `Downloading content for Project Gutenberg book #${input.bookId}...`
  );

  await downloadEbookMainCollectionContent(
    input.bookId,
    {
      url: input.mcMirrorUrl,
      rsyncModule: input.mcMirrorModule,
    },
    input.path
  );

  reportStepEnd(stepName, `Content downloaded.`, stepStartTime);
}

async function processDownloadEbookGeneratedCollectionContentStep(input: Args) {
  const stepName = "[generated collection]";
  const stepStartTime = reportStepStart(
    stepName,
    `Downloading content for Project Gutenberg book #${input.bookId}...`
  );

  await downloadEbookGeneratedCollectionContent(
    input.bookId,
    {
      url: input.gcMirrorUrl,
      rsyncModule: input.gcMirrorModule,
    },
    input.path
  );

  reportStepEnd(stepName, `Content downloaded.`, stepStartTime);
}

function reportStepStart(stepName: string, msg: string): number {
  console.log(stepName.padEnd(30), msg);

  return Date.now();
}

function reportStepEnd(
  stepName: string,
  msg: string,
  stepStartTime: number
): void {
  console.log(
    stepName.padEnd(30),
    msg,
    `Took ${new Intl.NumberFormat().format(
      Math.round(Date.now() - stepStartTime)
    )}ms.`
  );
}
