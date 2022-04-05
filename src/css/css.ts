import { isGlob } from '../utils';
import { globFilesAsync, readFileAsync, writeFileAsync } from '../fs';

const purify = require('purify-css');

/**
 * Removes unused CSS selectors from the given files where those selectors are not used in the source files.
 * @param cssFiles The CSS files.
 * @param sourceFiles The files to search for selectors in.
 * @param whitelist A collection of selectors to whitelist.
 * @param minify Minifies the result.
 */
export async function removeUnusedSelectors(cssFiles: string[] | string, sourceFiles: string[] | string, whitelist?: string[], minify = true): Promise<void> {
  if (typeof cssFiles === 'string') {
    cssFiles = isGlob(cssFiles) ? await globFilesAsync(cssFiles, {}) as string[] : [cssFiles];
  }

  if (typeof sourceFiles === 'string') {
    sourceFiles = isGlob(sourceFiles) ? await globFilesAsync(sourceFiles, {}) as string[] : [sourceFiles];
  }

  let globbedSourceFiles: string[] = [];

  for (let i = sourceFiles.length - 1; i >= 0; i--) {
    if (isGlob(sourceFiles[i])) {
      globbedSourceFiles = globbedSourceFiles.concat(await globFilesAsync(sourceFiles[i], {}));
      sourceFiles.splice(i, 1);
    }
  }

  if (globbedSourceFiles.length) {
    sourceFiles = sourceFiles.concat(...new Set(globbedSourceFiles));
  }

  const options: any = {
    minify
  };

  if (whitelist && whitelist.length) {
    options.whitelist = whitelist;
  }

  for (const filename of cssFiles) {
    let contents = await readFileAsync(filename, 'utf8');
    contents = purify(sourceFiles, contents, options);
    await writeFileAsync(filename, contents, 'utf8');
  }
}
