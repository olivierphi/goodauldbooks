import axios from "axios";
import { createWriteStream } from "fs";
import { Stream } from "stream";

export async function downloadFile(
  fileUrl: string,
  localFilePath: string
): Promise<void> {
  const response = await axios.get<Stream>(fileUrl, {
    method: "GET",
    responseType: "stream",
  });

  // pipe the result stream into a file on disc
  response.data.pipe(createWriteStream(localFilePath));

  // return a promise and resolve when download finishes
  return new Promise<void>((resolve, reject) => {
    response.data.on("end", () => {
      resolve();
    });

    response.data.on("error", e => {
      reject(e);
    });
  });
}
