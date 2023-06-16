import stylelint, { Config, LinterOptions } from 'stylelint';
import { log } from '../utils/index.js';

const { lint } = stylelint;

/**
 * Runs stylelint on a glob pattern and reports the results to the console.
 * @param files A glob pattern of files to lint.
 * @param config A path to a .stylelintrc config file, or a JSON object containing stylelint configuration.
 * @param report Whether to report the results to console or not.
 */
export async function lintSass(files: string, config?: string | JSON, report = true): Promise<boolean> {
  const options: Partial<LinterOptions> = {
    files,
    formatter: 'string'
  };

  if (typeof config === 'string') {
    options.configFile = config;
  } else if (typeof config === 'object') {
    options.config = config as Partial<Config>;
  }

  const result = await lint(options);

  if (report && result.errored) {
    log(result.output);
  }

  return !result.errored;
}
