import { isAbsolute } from 'path';
import { exec } from 'child_process';
import * as glob from 'glob';

import { readFileAsync, outputFileAsync, copy } from '../fs';
import { FileTemplateData } from './file-template-data';
import { log } from './log';

const template = require('lodash.template');
const slash = require('slash');
const cpath = require('canonical-path');

const TIME_UNITS = ['s', 'ms', 'μp'];

export enum OS {
  Unknown = 'unknown',
  Mac = 'mac',
  Windows = 'windows',
  Linux = 'linux'
}

export enum InstallType {
  Template,
  Copy
}

export interface InstallFileDescriptor {
  type: InstallType;
  path: string;
  outputPath: string;
}

/**
 * Reads in a file template and returns the resulting file contents.
 * @param {string} filePath The path the file template.
 * @param {Record<string, never>} values The template values.
 */
export async function templateFile<T extends FileTemplateData>(filePath: string, values: T, templateOptions?: any): Promise<string> {
  const contents = await readFileAsync(filePath, { encoding: 'utf-8' });
  return template(contents, templateOptions)(values);
}

/**
 * Installs files to the destination directory.
 * @param files
 * @param dest
 * @param templateValues
 */
export async function installFiles<T extends FileTemplateData>(files: InstallFileDescriptor[], templateData?: T, templateOptions?: any): Promise<void> {
  for (const descriptor of files) {
    switch (descriptor.type) {
      case InstallType.Template:
        if (!templateData) {
          throw new Error('Template data is required.');
        }

        const contents = await templateFile(descriptor.path, templateData, templateOptions);
        await outputFileAsync(descriptor.outputPath, contents, 'utf-8');
        break;
      case InstallType.Copy:
        copy(descriptor.path, descriptor.outputPath);
        break;
      default:
        break;
    }
  }
}

/**
 * Forms an absolute path from either an absolute or relative path.
 * @param path The path to convert.
 * @param cwd The root directory to start in to form an absolute path from relative.
 */
export function absolutify(path: string, cwd: string): string {
  path = slash(path);
  return isAbsolute(path) ? path : cpath.resolve(cwd, path);
}

/** Executes a terminal command. */
export function runCommand(command: string, cwd?: string, live = true): Promise<string> {
  return new Promise((resolve, reject) => {
    const maxBuffer = 512000;
    const options = cwd ? { cwd, maxBuffer } : { maxBuffer };
    const process = exec(command, options, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout as string);
      }
    });

    if (live && process.stderr && process.stdout) {
      process.stderr.on('data', data => log(data));
      process.stdout.on('data', data => log(data));
    }
  });
}

/**
 * Executes an async function with a progress display.
 * @param title The title of the task to display in the console.
 * @param fn The async task function execute.
 * @param quiet Whether to execute the task with output status messaging.
 */
export async function runTask<T>(title: string, fn: () => Promise<T>, quiet = false): Promise<T> {
  // If we are in quiet mode, we just execute the task silently and return its result
  if (quiet) {
    return await fn();
  }

  const ora = require('ora');
  const spinner = ora(title).start();

  try {
    const start = process.hrtime();
    const value = await fn();
    const elapsed = process.hrtime(start);
    const chalk = require('chalk');
    spinner.succeed(`${title} ${chalk.dim('in ' + formatHrTime(elapsed))}`);
    return value;
  } catch (e) {
    spinner.fail(`${title}: ${e.message}`);
    spinner.stop();
    throw e;
  }
}

/**
 * Formats hrtime.
 * @param hrtime
 */
export function formatHrTime(hrtime: any): string {
  let time = (hrtime[0] + (hrtime[1] / 1e9)) as number;
  let index = 0;
  for (; index < TIME_UNITS.length - 1; index++, time *= 1000) {
    if (time >= 1) {
      break;
    }
  }
  return time.toFixed(2) + TIME_UNITS[index];
}

/**
 * Copy the values of all of the enumerable own properties from a source object to a
 * target object, where value is defined only. Returns the target object.
 * @param {T} target The target object to copy to.
 * @param {U} source The source object from which to copy properties.
 */
export function assignDefined<T, U>(target: T, source: U): T & U {
  Object.keys(source)
    .filter(key => (source as any)[key] !== undefined)
    .forEach(key => (target as any)[key] = (source as any)[key]);
  return target as any;
}

/**
 * Determines if there are any glob characters within the provided string.
 */
export function isGlob(str: string): boolean {
  return glob.hasMagic(str);
}
