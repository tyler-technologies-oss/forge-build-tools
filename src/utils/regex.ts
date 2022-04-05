/**
 * Creates a regular expression from a list of module names to use as a replacer
 * regex in a TS/JS file to update relative imports to use their proper module
 * import names.
 * @param {string[]} moduleNames An array of module names.
 */
export function createRelativeImportRegex(moduleNames: string[]): RegExp {
  return new RegExp(`^(import(?:["'\\s]*(?:[\\w*{}\\n, ]*)from)?\\s*["'])(?:\\.{1,2}\\/)[.\\/]*?(?:fx\/)?(${moduleNames.join('|')})\\/(?:.*)(["'];?)(.*)$`, 'gm');
}
