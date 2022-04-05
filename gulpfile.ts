import { chmodSync } from 'fs';
import { task, series } from 'gulp';
import { resolve, join } from 'path';
import { lintESLint, deleteDir, copyFilesAsync, compileTypeScript, modifyFile } from './src';

const ROOT = resolve(__dirname, './');
const OUTPUT_DIR = join(ROOT, 'dist');
const SRC_DIR = join(ROOT, 'src');

/** Cleans the build output directory. */
task('clean', () => deleteDir(OUTPUT_DIR));

/** Lints the TypeScript files in the project. */
task('eslint', () => {
  const paths = [
    join(SRC_DIR, '**/*.ts'),
    join(ROOT, 'gulpfile.ts')
  ];
  return lintESLint(paths);
});

/** Compiles the TypeScript files in the source directory to the build output directory. */
task('compile:ts', () => compileTypeScript(join(SRC_DIR, '**/*.ts'), join(ROOT, 'tsconfig.json')));

/** Copies the package.json to the build output directory. */
task('copy:packageJson', () => copyFilesAsync(join(ROOT, 'package.json'), ROOT, OUTPUT_DIR));

/** Adjusts the package.json to prepare it for public distribution. */
task('fixup:packageJson', async () => {
  const packageJsonPath = join(OUTPUT_DIR, 'package.json');
  chmodSync(packageJsonPath, 0o777);
  await modifyFile(packageJsonPath, info => {
    const json = JSON.parse(info.contents);
    delete json.devDependencies;
    delete json.scripts;
    return JSON.stringify(json, null, 2);
  });
});

task('build', series('clean', 'eslint', 'compile:ts', 'copy:packageJson', 'fixup:packageJson'));
