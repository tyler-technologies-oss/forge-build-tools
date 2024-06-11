import { readdirSync, statSync, existsSync } from 'fs';
import { extname } from 'path';
import { deleteAsync } from 'del';
import cpath from 'canonical-path';

/**
 * Gets a list of directory names in `directoryPath` that contain all files in `files`.
 * @param {string} directoryPath The root directory to search.
 * @param {string | string[]} files A single filename or array of filenames to ensure each directory contains.
 * @param {string | string[] | null} [excludedDirectories=null] Directories names to ignore within `directoryPath`.
 * @returns {string[]} An array of directory names.
 */
export function getDirectoriesContainingFiles(directoryPath: string, files: string | string[], excludedDirectories: string | string[] | null = null): string[] {
  const filesAry = files instanceof Array ? files : [files];
  const excludedDirectoriesAry = excludedDirectories instanceof Array || !excludedDirectories ? excludedDirectories : [excludedDirectories];
  return readdirSync(directoryPath).filter(file => {
    if (excludedDirectoriesAry && excludedDirectoriesAry.indexOf(file) >= 0) {
      return false;
    }
    const checkPath = cpath.join(directoryPath, file);
    return statSync(checkPath).isDirectory() && filesAry.every(f => existsSync(cpath.join(checkPath, f)));
  });
}

/** Removes directories in the specified paths */
export function cleanDirectories(paths: string | string[]): Promise<string[]> {
  return deleteAsync(paths);
}

/** Removes files in the specified paths */
export function cleanFiles(paths: string | string[]): Promise<string[]> {
  return deleteAsync(paths);
}

/** Finds all directory names containing a file with the provided extension. */
export function findDirectoriesContainingFileByExtension(startPath: string, extension: string, paths: Array<{ name: string; path: string }> = []): Array<{ name: string; path: string }> {
  readdirSync(startPath).forEach(file => {
    const checkPath = cpath.join(startPath, file);
    if (statSync(checkPath).isDirectory()) {
      const fileCount = readdirSync(checkPath).filter(subFile => !statSync(cpath.join(checkPath, subFile)).isDirectory() && extname(subFile) === extension).length;
      if (fileCount) {
        paths.push({ name: file, path: checkPath });
      }

      paths = findDirectoriesContainingFileByExtension(checkPath, extension, paths);
    }
  });

  return paths;
}

/**
 * Finds all subdirectories within `srcPath`.
 * @param {string} srcPath The directory to search in.
 * @returns {string[]} The directories paths.
 */
export function getDirectories(srcPath: string): string[] {
  return readdirSync(srcPath)
    .map(file => cpath.join(srcPath, file))
    .filter(path => statSync(path).isDirectory());
}

/**
 * Finds all directories and sub-directories within `srcPath`.
 * @param {string} srcPath The directory to search in.
 * @returns {string[]} The directory paths.
 */
export function getDirectoriesRecursive(dir: string, dirs: string[] = []): string[] {
  readdirSync(dir).forEach(file => {
    const dirPath = cpath.join(dir, file);
    const isDirectory = statSync(dirPath).isDirectory();
    if (isDirectory) {
      dirs.push(dirPath);
      getDirectoriesRecursive(cpath.join(dir, file), dirs);
    }
  });
  return dirs;
}
