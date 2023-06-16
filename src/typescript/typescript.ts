import ts from 'typescript';

import { TS_LIB_MAP } from '../constants.js';
import { isGlob, log, logError, logInfo, logWarn } from '../utils/index.js';
import { readJsonFile, globFilesAsync } from '../fs/index.js';

export interface ITypeScriptCompilerOptions extends ts.CompilerOptions {}

/**
 * Compiles a list of TypeScript file paths to JavaScript and emits their
 * @param files The list of source filenames to compile.
 * @param options The TypeScript compiler options.
 */
export async function compileTypeScript(files: string[] | string, options: ITypeScriptCompilerOptions | string): Promise<void> {
  if (typeof files === 'string') {
    files = isGlob(files) ? await globFilesAsync(files, {}) as string[] : [files];
  }

  if (typeof options === 'string') {
    const tsconfig = await readJsonFile(options) as any;
    if (tsconfig && tsconfig.compilerOptions) {
      options = tsconfig.compilerOptions;
    } else {
      throw new Error('Invalid configuration file specified: ' + options);
    }
  }

  options = normalizeCompilerOptions(options as ts.CompilerOptions);

  // The TypeScript compiler API requires lib entries to be specified as the whole
  // filename (i.e. lib.es2015.d.ts), which differs from the regular tsconfig lib entries. This allows
  // lib entries to specified the same way (i.e. es2015 => lib.es2015.d.ts)
  if (options.lib) {
    options.lib = options.lib.map(lib => TS_LIB_MAP[lib] || lib);
  }
  
  const program = ts.createProgram(files, options);
  const emitResult = program.emit();
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start as number);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      getDiagnosticLogger(diagnostic.category)(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      log(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
    }
  });

  if (options.noEmitOnError && allDiagnostics.some(d => d.category === ts.DiagnosticCategory.Error)) {
    logError('TypeScript compilation failed.');
    process.exit(1);
  }
}

function getDiagnosticLogger(diagnostic: ts.DiagnosticCategory): (...args: any[]) => void {
  switch (diagnostic) {
    case ts.DiagnosticCategory.Error:
      return logError;
    case ts.DiagnosticCategory.Message:
      return log;
    case ts.DiagnosticCategory.Suggestion:
      return logInfo;
    case ts.DiagnosticCategory.Warning:
      return logWarn;
  }
}

/**
 * Converts TypeScript compiler options to their node API-compatible values.
 * @param options 
 */
export function normalizeCompilerOptions(options: ts.CompilerOptions): ts.CompilerOptions {
  if (options.moduleResolution && typeof options.moduleResolution === 'string') {
    switch ((options.moduleResolution as string).toLowerCase().trim()) {
      case 'classic':
        options.moduleResolution = ts.ModuleResolutionKind.Classic;
        break;
      case 'node':
        options.moduleResolution = ts.ModuleResolutionKind.NodeJs;
        break;
      default:
        delete options.moduleResolution;
    }
  }

  if (options.module && typeof options.module === 'string') {
    switch ((options.module as string).toLowerCase().trim()) {
      case 'amd':
        options.module = ts.ModuleKind.AMD;
        break;
      case 'commonjs':
        options.module = ts.ModuleKind.CommonJS;
        break;
      case 'es2015':
        options.module = ts.ModuleKind.ES2015;
        break;
      case 'esnext':
        options.module = ts.ModuleKind.ESNext;
        break;
      case 'system':
        options.module = ts.ModuleKind.System;
        break;
      case 'umd':
        options.module = ts.ModuleKind.UMD;
        break;
      case 'none':
        options.module = ts.ModuleKind.None;
        break;
      default:
        delete options.module;
    }
  }

  if (options.target && typeof options.target === 'string') {
    switch ((options.target as string).toUpperCase().trim()) {
      case 'ES3':
        options.target = ts.ScriptTarget.ES3;
        break;
      case 'ES5':
        options.target = ts.ScriptTarget.ES5;
        break;
      case 'ES6':
      case 'ES2015':
        options.target = ts.ScriptTarget.ES2015;
        break;
      case 'ES2016':
        options.target = ts.ScriptTarget.ES2016;
        break;
      case 'ES2017':
        options.target = ts.ScriptTarget.ES2017;
        break;
      case 'ES2018':
        options.target = ts.ScriptTarget.ES2018;
        break;
      case 'ESNEXT':
        options.target = ts.ScriptTarget.ESNext;
        break;
      default:
        delete options.target;
    }
  }

  return options;
}
