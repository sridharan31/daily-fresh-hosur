// web-stubs/filesystem.js

const DocumentDirectoryPath = '/documents';
const CachesDirectoryPath = '/cache';
const ExternalDirectoryPath = '/external';

const writeFile = (filepath, contents, encoding = 'utf8') => {
  console.log('File write (web):', filepath);
  return Promise.resolve();
};

const readFile = (filepath, encoding = 'utf8') => {
  console.log('File read (web):', filepath);
  return Promise.resolve('');
};

const exists = (filepath) => {
  console.log('File exists check (web):', filepath);
  return Promise.resolve(false);
};

const unlink = (filepath) => {
  console.log('File delete (web):', filepath);
  return Promise.resolve();
};

const mkdir = (filepath) => {
  console.log('Directory create (web):', filepath);
  return Promise.resolve();
};

const readDir = (dirpath) => {
  console.log('Directory read (web):', dirpath);
  return Promise.resolve([]);
};

export default {
  DocumentDirectoryPath,
  CachesDirectoryPath,
  ExternalDirectoryPath,
  writeFile,
  readFile,
  exists,
  unlink,
  mkdir,
  readDir,
};

export {
  DocumentDirectoryPath,
  CachesDirectoryPath,
  ExternalDirectoryPath,
  writeFile,
  readFile,
  exists,
  unlink,
  mkdir,
  readDir,
};
