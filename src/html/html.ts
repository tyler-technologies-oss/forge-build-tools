const htmlMinifier = require('html-minifier');

/**
 * Minifies HTML content.
 * @param html The HTML to minify.
 * @param options The options to pass to `html-minifier`.
 */
export function minifyHtml(html: string, options?: any): string {
  const defaultOptions = {
    preserveLineBreaks: false,
    collapseWhitespace: true,
    removeComments: true
  };
  options = options ? Object.assign(defaultOptions, options) : defaultOptions;
  return htmlMinifier.minify(html, options);
}
