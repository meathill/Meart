import fs from 'fs';
import {promisify} from 'util';

const appendFile = promisify(fs.appendFile);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat= promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

export {
  appendFile,
  exists,
  mkdir,
  readDir,
  readFile,
  stat,
  writeFile,
};