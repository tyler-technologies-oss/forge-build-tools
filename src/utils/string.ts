const camelcase = require('camelcase');

/**
 * Converts a string value to dash-case.
 * Ex. someTestValue => some-test-value
 * @param {string} value The string to convert
 */
export function dashify(value: string): string {
  if (!value || typeof value !== 'string') {
    return value;
  }
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Converts a string to camelcase (i.e. SomeStringValue).
 * If the `pascal` parameter is passed as false, the first letter will be lowercased (i.e. someStringValue).
 * @param {string} str The input string.
 * @param {boolean} [pascal=true] Uppercase the first letter.
 */
export function camelCase(str: string, pascal = true): string {
  return camelcase(str, { pascalCase: pascal });
}
