import { minify } from 'html-minifier-terser';

/**
 * Minifies HTML content.
 * @param html The HTML to minify.
 * @param options The options to pass to `html-minifier-terser`.
 */
export async function minifyHtml(html: string, options?: any): Promise<string> {
  const defaultOptions = {
    preserveLineBreaks: false,
    collapseWhitespace: true,
    removeComments: true
  };
  options = options ? Object.assign(defaultOptions, options) : defaultOptions;
  return await minify(html, options);
}
