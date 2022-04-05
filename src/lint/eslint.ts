import { ESLint } from 'eslint';
import { log } from '../utils';

export interface ILintESLintResult {
  hasError: boolean;
  hasWarning: boolean;
  errorResults: ESLint.LintResult[];
  results: ESLint.LintResult[];
  resultText: string;
}

export interface ILintESLintConfiguration {
  options?: ILintESLintOptions;
  commitFixes?: boolean;
  report?: boolean;
  formatter?: string;
}

export interface ILintESLintOptions extends ESLint.Options {}

/**
 * Runs ESLint on a set of files.
 * @param paths The paths or glob patterns to use for finding files to lint.
 * @param config The linting configuration.
 * @returns A `Promise` containing the results of the linting process.
 */
export async function lintESLint(paths: string | string[], config?: ILintESLintConfiguration): Promise<ILintESLintResult> {
  const eslint = new ESLint(config?.options);
  const results = await eslint.lintFiles(paths);

  if (config?.options?.fix && config?.commitFixes) {
    await ESLint.outputFixes(results);
  }

  const hasError = results.some(r => r.errorCount > 0);
  const hasWarning = results.some(r => r.warningCount > 0);
  const formatter = await eslint.loadFormatter(config?.formatter || 'codeframe');
  const resultText = await formatter.format(results);
  const errorResults = ESLint.getErrorResults(results);
  const canReport = config?.report || config?.report === undefined;
  
  if (canReport && resultText && (hasError || hasWarning)) {
    log(resultText);
  }

  return { hasError, hasWarning, errorResults, results, resultText };
}
