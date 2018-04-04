#!/usr/bin/env node

// import * as shell from "shelljs";
import * as yargs from "yargs";
// import { downloadFile } from "../utils/http-utils";

yargs
  .usage("$0 <cmd> [args]")
  .command(
    "hello [name]",
    "welcome ter yargs!",
    (args: yargs.Argv) => {
      return args.positional("name", {
        type: "string",
        default: "Cambi",
        describe: "the name to say hello to",
      });
    },
    (argv: yargs.Arguments) => {
      console.log("hello", argv.name, "welcome to yargs!");
    }
  )
  .help().argv;
