import { parse, join, dirname } from 'path';

import { existsSync } from '../fs/fs.js';

/**
 * Finds a directory/file above the provided `from` directory.
 * @param names Names of items to search for.
 * @param from The directory to start searching from.
 */
export function findUp(names: string | string[], from: string): string | null {
  if (!Array.isArray(names)) {
    names = [names];
  }
  const root = parse(from).root;

  let currentDir = from;
  while (currentDir && currentDir !== root) {
    for (const name of names) {
      const p = join(currentDir, name);
      if (existsSync(p)) {
        return p;
      }
    }

    currentDir = dirname(currentDir);
  }

  return null;
}
