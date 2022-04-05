import { runCommand, runTask, OS } from './utils';
import { logInfo, logError } from './log';
import { setFileAttrSync } from '../fs';

const cpath = require('canonical-path');

export interface IPackageJson {
  [key: string]: any;
  name: string;
  description?: string;
  version: string;
  publishConfig?: IPackagJsonPublishConfig;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
  peerDependencies?: { [key: string]: string };
}

export interface IPackagJsonPublishConfig {
  registry?: string;
}

/**
 * Loads the package.json file at the specified `dir`.
 * @param dir The directory the file lives in.
 */
export function loadPackageJson(dir: string): IPackageJson {
  let p: any = null;

  try {
    p = require(cpath.join(dir, 'package.json'));
  } catch (e) {}

  return p;
}

/**
 * Restores npm and jspm packages.
 * @param {string} cwd The current working directory to execute the command in.
 * @param {OS} os The OS we are running in.
 * @param {boolean} [npm=true] Install packages through npm.
 * @param {boolean} [jspm=true] Install packages through jspm.
 */
export async function restorePackages(cwd: string, os: OS, packages?: string[], dev = false, npm = true, jspm = true): Promise<void> {
  // If on windows, attempt to remove any readonly attributes from the installation directory
  if (os === OS.Windows) {
    logInfo('Removing readonly attributes...');

    try {
      setFileAttrSync(cwd, { readonly: false });
    } catch (e) {
      logError('Unable to remove readonly attributes.', e);
    }

    logInfo('Readonly attributes removed.');
  }

  if (npm) {
    await runTask('Installing npm package(s)...', () => {
      const command = ['npm', 'install'];

      if (dev) {
        command.push('--save-dev');
      } else {
        command.push('--save');
      }

      if (packages) {
        command.push(packages.join(' '));
      }

      return runCommand(command.join(' '), cwd);
    });
  }

  if (jspm) {
    await runTask('Installing jspm package(s)...', () => {
      const command = ['npx', 'jspm', 'install'];

      if (dev) {
        command.push('--dev');
      }

      if (packages) {
        command.push(packages.join(' '));
      }

      return runCommand(command.join(' '), cwd);
    });
  }
}

/**
 * Uninstalls npm and jspm packages.
 * @param {string} cwd The current working directory to execute the command in.
 * @param {OS} os The OS we are running in.
 * @param {boolean} [npm=true] Uninstall packages through npm.
 * @param {boolean} [jspm=true] Uninstall packages through jspm.
 */
export async function uninstallPackages(cwd: string, os: OS, packages?: string[], dev = false, npm = true, jspm = true): Promise<void> {
  // If on windows, attempt to remove any readonly attributes from the installation directory
  if (os === OS.Windows) {
    logInfo('Removing readonly attributes...');

    try {
      setFileAttrSync(cwd, { readonly: false });
    } catch (e) {
      logError('Unable to remove readonly attributes.', e);
    }

    logInfo('Readonly attributes removed.');
  }

  if (npm) {
    await runTask('Uninstalling npm package(s)...', () => {
      const command = ['npm', 'uninstall'];

      if (dev) {
        command.push('--save-dev');
      } else {
        command.push('--save');
      }

      if (packages) {
        command.push(packages.join(' '));
      }

      return runCommand(command.join(' '), cwd);
    });
  }

  if (jspm) {
    await runTask('Uninstalling jspm package(s)...', () => {
      const command = ['npx', 'jspm', 'uninstall'];

      if (dev) {
        command.push('--dev');
      }

      if (packages) {
        command.push(packages.join(' '));
      }

      return runCommand(command.join(' '), cwd);
    });
  }
}

/**
 * Prunes npm packages via npm prune.
 * @param {string} cwd The current working directory to execute teh command in.
 * @param {OS} os The OS we are running in.
 * @param {boolean} dev Whether or not we are in development mode.
 */
export async function prunePackages(cwd: string, os: OS, dev = false): Promise<void> {
  if (os === OS.Windows) {
    logInfo('Removing readonly attributes...');

    try {
      setFileAttrSync(cwd, { readonly: false });
    } catch (e) {
      logError('Unable to remove readonly attributes.', e);
    }

    logInfo('Readonly attributes removed.');
  }

  await runTask('Pruning npm package(s)...', () => {
    const command = ['npm', 'prune'];

    if (dev) {
      command.push('--no-production');
    } else {
      command.push('--production');
    }

    return runCommand(command.join(' '), cwd);
  });
}
