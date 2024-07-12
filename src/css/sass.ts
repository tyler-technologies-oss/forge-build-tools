import { renderSync as dartSassRenderSync } from 'sass';
import autoprefixer from 'autoprefixer';
import postcss, { ProcessOptions } from 'postcss';
import CleanCSS from 'clean-css';
import cpath from 'canonical-path';

import { globFilesAsync, writeFileAsync, mkdirp } from '../fs/index.js';
import { isGlob, logWarn } from '../utils/index.js';

/**
 * Compiles .scss files to .css files within a `rootDir` and outputs them to the `outputDir`.
 * @param {string[] | string} files An array of filenames, or a glob pattern to find files.
 * @param {string} rootDir The common root directory in which the input files live. This is used to build the structure within the output directory.
 * @param {string} outputDir The output directory where the .css files will be written to.
 */
export async function compileSass(files: string[] | string, rootDir: string, outputDir: string): Promise<string[]> {
  if (typeof files === 'string') {
    files = isGlob(files) ? await globFilesAsync(files, {}) as string[] : [files];
  }

  rootDir = cpath.resolve(rootDir).replace(/\/?$/, '/');
  outputDir = cpath.resolve(outputDir);
  let includedFiles: string[] = [];

  for (const file of files) {
    const result = dartSassRenderSync({ file, includePaths: ['node_modules'], sourceMap: false });
    includedFiles = includedFiles.concat(result.stats.includedFiles);
    let cssContent = await runPostCss(file, result.css.toString());
    cssContent = minifyCss(cssContent);
    const relativeFilePath = cpath.resolve(file).replace(rootDir, '').replace(/^\//, '').replace(/\.scss$/, '.css');
    const outputFilePath = cpath.join(outputDir, relativeFilePath);
    const outputPath = cpath.dirname(outputFilePath);
    mkdirp(outputPath);
    await writeFileAsync(outputFilePath, cssContent, 'utf-8');
  }

  return includedFiles;
}

/**
 * Runs CSS transformers on the provided CSS content.
 * @param filename The CSS filename.
 * @param css The CSS content.
 */
export async function runPostCss(filename: string, css: string): Promise<string> {
  const autoprefixerOptions: autoprefixer.Options = {
    overrideBrowserslist: [
      'last 2 versions',
      'not ie <= 10',
      'not ie_mob <= 10'
    ],
    cascade: false
  };
  const postcssOptions: ProcessOptions = { from: filename };
  const postCssPlugins: any[] = [autoprefixer(autoprefixerOptions)];
  const postCssResult = await postcss(postCssPlugins).process(css, postcssOptions);
  postCssResult.warnings().forEach(warning => logWarn(warning.text));
  return postCssResult.css;
}

/**
 * Minifies CSS content.
 * @param css The CSS content.
 */
export function minifyCss(css: string): string {
  return new CleanCSS({ rebase: false }).minify(css).styles;
}
