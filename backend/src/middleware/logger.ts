import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import fs from "fs";

const logDirectory = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: logDirectory,
  maxFiles: 7,
  compress: "gzip",
});

export const logger = morgan("combined", {
  stream: accessLogStream,
});
