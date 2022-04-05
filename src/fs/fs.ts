import * as fs from 'fs';
import * as util from 'util';
import rimraf from 'rimraf';
import * as tmp from 'tmp';

import { isGlob, logError } from '../utils';

const winattr = require('winattr');
const fsExtra = require('fs-extra');
const glob = require('glob');
const cpath = require('canonical-path');

export const existsSync = (path: string): boolean => fs.existsSync(path);

// Export promisified fs functions here
export const mkdirAsync = util.promisify(fs.mkdir);
export const mkdirp = fsExtra.mkdirpSync;
export const copy = fsExtra.copySync;
export const copyAsync = util.promisify(fsExtra.copy);
export const symlinkAsync = util.promisify(fs.symlink);
export const readFileAsync = util.promisify(fs.readFile);
export const writeFileAsync = util.promisify(fs.writeFile);
export const existsAsync = util.promisify(fs.exists);
export const readdirAsync = util.promisify(fs.readdir);
export const statAsync = util.promisify(fs.stat);
export const lstatAsync = util.promisify(fs.lstat);
export const removeSync = fsExtra.removeSync;
export const ensureDir = util.promisify(fsExtra.ensureDir);
export const ensureDirSync = fsExtra.ensureDirSync;
export const outputFileAsync = fsExtra.outputFile;
export const setFileAttrSync = winattr.setSync;
export const globFiles: string[] = glob.sync;
export const globFilesAsync = util.promisify(glob);
export const emptyDir = fsExtra.emptyDirSync;
export const emptyDirAsync = fsExtra.emptyDir;
export const deleteDir = util.promisify(rimraf);
export const rename = util.promisify(fs.rename);
export const deleteFile = util.promisify(fs.unlink);
export const moveAsync = util.promisify(fsExtra.move);

/**
 * Deletes the list of files.
 * @param files The files to delete.
 */
export async function deleteFiles(files: string | string[]): Promise<void> {
  if (typeof files === 'string') {
    files = isGlob(files) ? await globFilesAsync(files, {}) as string[] : [files];
  }

  files.forEach(filename => deleteFile(cpath.resolve(filename)));
}

/**
 * Moves an array of files or a glob pattern of files to a directory.
 * @param {string[] | string} files The array of files or a glob pattern of files to search for.
 * @param {string} rootDir The common root directory in which to build the structure in the output directory.
 * @param {string} outputDir The output directory path.
 */
export async function moveFiles(files: string[] | string, rootDir: string | null, outputDir: string): Promise<void> {
  if (typeof files === 'string') {
    files = isGlob(files) ? await globFilesAsync(files, {}) as string[] : [files];
  }

  if (rootDir) {
    rootDir = cpath.resolve(rootDir);
  }
  outputDir = cpath.resolve(outputDir);

  for (const filename of files) {
    const absoluteFilePath = cpath.resolve(filename);
    const filePath = rootDir ? absoluteFilePath.replace(rootDir, '').replace(/^\//, '') : cpath.basename(absoluteFilePath);
    const outputFilePath = cpath.join(outputDir, filePath);
    mkdirp(cpath.dirname(outputFilePath));
    await rename(filename, outputFilePath);
  }
}

/**
 *
 * @param dirs The directory paths to move.
 * @param outputDir The new directory location.
 */
export async function moveDirectories(dirs: string[], outputDir: string): Promise<void> {
  for (const dir of dirs) {
    const outputPath = cpath.join(outputDir, cpath.basename(dir));
    if (existsSync(dir) && !existsSync(outputPath)) {
      await moveAsync(dir, outputPath);
    }
  }
}

/**
 * Copies an array of files or a glob pattern of files to a directory.
 * @param {string | string[]} files The array of files or a glob pattern of files to search for.
 * @param {string} rootDir The common root directory in which to build the structure in the output directory.
 * @param {string | string[]} outputDirs The output directory path.
 */
export async function copyFilesAsync(files: string | string[], rootDir: string | null, outputDirs: string | string[]): Promise<void> {
  if (typeof files === 'string') {
    files = isGlob(files) ? await globFilesAsync(files, {}) as string[] : [files];
  }

  if (typeof outputDirs === 'string') {
    outputDirs = [outputDirs];
  }

  if (!(outputDirs instanceof Array)) {
    throw new Error('outputDirs must be an array.');
  }

  if (rootDir) {
    rootDir = cpath.resolve(rootDir);
  }

  outputDirs = outputDirs.map(dir => cpath.resolve(dir));
  outputDirs.forEach(dir => mkdirp(dir));

  for (const file of files) {
    const absoluteFilePath = cpath.resolve(file);
    const promises: Array<Promise<void>> = [];

    for (const outputDir of outputDirs) {
      const relativePath = rootDir ? absoluteFilePath.replace(rootDir, '').replace(/^\//, '') : cpath.basename(absoluteFilePath);
      const outputFilePath = cpath.join(outputDir, relativePath);
      promises.push(copy(file, outputFilePath));
    }

    await Promise.all(promises);
  }
}

export interface IFileCopyConfig {
  path: string | string[];
  outputPath: string;
  rootPath?: string;
}

/**
 * Copies the provided files from one directory to another.
 * @param fileConfigs The file copy descriptors.
 */
export async function copyFilesMultiple(fileConfigs: IFileCopyConfig[]): Promise<void> {
  if (fileConfigs.some(config => !config.path || !config.outputPath)) {
    throw new Error('Every file config must specify valid path and outputPath properties.');
  }

  for (const config of fileConfigs) {
    let files: string[] = [];

    if (typeof config.path === 'string') {
      files = isGlob(config.path) ? await globFilesAsync(config.path, {}) : [config.path];
    } else if (config.path instanceof Array) {
      for (const filename of config.path) {
        files = files.concat(isGlob(filename) ? await globFilesAsync(filename, {}) : [filename]);
      }
    } else {
      throw new Error('Invalid filepath provided.');
    }

    const outputPath = cpath.resolve(config.outputPath);
    mkdirp(outputPath);

    for (const file of files) {
      const absoluteFilePath = cpath.resolve(file);
      const outputFilePath = config.rootPath ? cpath.join(outputPath, absoluteFilePath.replace(cpath.resolve(config.rootPath), '').replace(/^\//, '')) : cpath.join(outputPath, cpath.basename(file));
      await copy(file, outputFilePath);
    }
  }
}

/**
 * Reads in a JSON file and returns an instance of it.
 * @param filepath The path to the file to read.
 */
export async function readJsonFile<T>(filepath: string): Promise<T | undefined> {
  let json: T | undefined;
  let contents: string;

  try {
    contents = await readFileAsync(filepath, 'utf-8');
  } catch {
    return undefined;
  }

  if (contents) {
    try {
      json = JSON.parse(contents);
    } catch (e) {
      logError('Invalid JSON file: ' + filepath);
    }
  }

  return json;
}

/**
 * Writes an object to a JSON file.
 * Note: overwrites the file, does not merge the JSON contents.
 * @param filepath The file path to write to.
 * @param data The object to convert to JSON.
 */
export async function writeJsonFile<T>(filepath: string, data: T): Promise<void> {
  const contents = JSON.stringify(data, null, '  ');
  await writeFileAsync(filepath, contents, 'utf8');
}

/**
 * Creates a new temporary directory.
 * @param options The options to pass to `tmp`.
 */
export async function createTempDir(options?: ITempOptions): Promise<ITempDirResult> {
  const defaultOptions: tmp.DirOptions = {
    mode: 0o777,
    keep: false,
    unsafeCleanup: true
  };
  const tmpOptions = Object.assign(defaultOptions, options) as tmp.DirOptions;
  return new Promise<ITempDirResult>((resolve, reject) => {
    tmp.setGracefulCleanup();
    tmp.dir(tmpOptions, (err, path, cleanupCallback) => {
      if (err) {
        reject(err);
      }

      const result = {
        path,
        remove: cleanupCallback
      };
      resolve(result);
    });
  });
}

/**
 * Replaces the extension in `inPath` with the extension specified in `extension`.
 * @param {string} inPath The path to replace the extension in.
 * @param {string} extension The new extension.
 */
export function replaceExtension(inPath: string, extension: string): string {
  if (!inPath || typeof inPath !== 'string') {
    return inPath;
  }
  const newPath = cpath.basename(inPath, cpath.extname(inPath)) + extension.replace(/^\.?/, '.');
  return cpath.join(cpath.dirname(inPath), newPath);
}

export interface ITempOptions {
  mode?: number;
  prefix?: string;
  postfix?: string;
  keep?: boolean;
  recursiveCleanup?: boolean;
}

export interface ITempDirResult {
  path: string;
  remove: () => void;
}
