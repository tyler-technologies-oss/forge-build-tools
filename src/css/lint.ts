import * as stylelint from 'stylelint';
import { log } from '../utils';

/**
 * Runs stylelint on a glob pattern and reports the results to the console.
 * @param files A glob pattern of files to lint.
 * @param config A path to a .stylelintrc config file, or a JSON object containing stylelint configuration.
 * @param report Whether to report the results to console or not.
 */
export async function lintSass(files: string, config?: string | JSON, report = true): Promise<boolean> {
  const options: Partial<stylelint.LinterOptions> = {
    files,
    formatter: 'string'
  };

  if (typeof config === 'string') {
    options.configFile = config;
  } else if (typeof config === 'object') {
    options.config = config as Partial<stylelint.Configuration>;
  }

  const result = await stylelint.lint(options);

  if (report && result.errored) {
    log(result.output);
  }

  return !result.errored;
}
