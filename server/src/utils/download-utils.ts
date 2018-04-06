import axios from "axios";
import { createWriteStream } from "fs";
import * as Rsync from "rsync";
import * as shell from "shelljs";
import { Stream } from "stream";

export async function downloadFileViaHttp(
  fileUrl: string,
  localFilePath: string
): Promise<string> {
  const response = await axios.get<Stream>(fileUrl, {
    method: "GET",
    responseType: "stream",
  });

  // pipe the result stream into a file on disc
  response.data.pipe(createWriteStream(localFilePath));

  // return a promise and resolve when download finishes
  return new Promise<string>((resolve, reject) => {
    response.data.on("end", () => {
      resolve(localFilePath);
    });

    response.data.on("error", e => {
      reject(e);
    });
  });
}

export interface RsyncOptions {
  rsyncModule?: string;
  username?: string;
  echo?: boolean;
  progress?: boolean;
}

export async function downloadFolderViaRsync(
  serverHostname: string,
  distantFolderPath: string,
  localFolderPath: string,
  options: RsyncOptions
): Promise<string> {
  const rsync = new Rsync();

  const source = [
    serverHostname,
    options.rsyncModule ? `::${options.rsyncModule}` : "",
    `/${distantFolderPath}`,
  ].join("");

  rsync
    .flags("a")
    .source(source)
    .destination(localFolderPath);
  if (options.progress) {
    rsync.progress();
  }
  if (options.echo) {
    rsync.flags("v");
  }

  return new Promise<string>((resolve, reject) => {
    const rsyncPid = rsync.execute(
      (error, code, cmd) => {
        if (error) {
          reject(error);
        } else {
          resolve(localFolderPath);
        }
      },
      (data: Buffer) => {
        options.echo && console.log("rsync output:", data.toString());
      },
      (data: Buffer) => {
        options.echo && console.log("rsync error:", data.toString());
      }
    );
  });
}
