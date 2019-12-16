import fs from 'src/electron/util/fs';
import {promisify} from 'util';
import mkdirpBase from 'mkdirp';
import ncpBase from 'ncp';

const appendFile = promisify(fs.appendFile);
const exists = fs.existsSync;
const mkdir = promisify(fs.mkdir);
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat= promisify(fs.stat);
const writeFile = promisify(fs.writeFile);
const readJSON = async file => {
  const content = await readFile(file, 'utf8');
  return JSON.parse(content);
};
const mkdirp = promisify(mkdirpBase);
const ncp = promisify(ncpBase.ncp);

export {
  appendFile,
  exists,
  mkdir,
  mkdirp,
  ncp,
  readDir,
  readFile,
  readJSON,
  stat,
  writeFile,
};
