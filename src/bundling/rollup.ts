import { ModuleFormat, GlobalsOption, Plugin, OutputOptions, rollup, RollupOptions } from 'rollup';
import { isAbsolute } from 'canonical-path';

const rollupUglify = require('rollup-plugin-uglify').uglify;
const uglifyEs = require('uglify-es').minify;
const uglifyJs = require('uglify-js').minify;

export interface IRollupBundleConfig {
  input: string;
  name: string;
  format: ModuleFormat;
  file: string;
  version: string;
  minify: boolean;
  globals: GlobalsOption;
  banner: string;
  plugins: Plugin[];
}

/**
 * Creates a rollup bundle from the provided configuration.
 * @param config The rollup bundle configuration options.
 */
export function createRollupBundle(config: IRollupBundleConfig): Promise<any> {
  const bundleOptions: RollupOptions = {
    context: 'this',
    external: (id: string) => {
      if ((config.globals as { [name: string]: string })[id]) {
        return true;
      }
      if (isAbsolute(id)) {
        if (!id.match(/node_modules/)) {
          return false;
        }
      } else if (id.match(/^\./)) {
        return false;
      }
      return true;
    },
    input: config.input,
    plugins: config.plugins || []
  };

  if (config.minify) {
    (bundleOptions.plugins as Plugin[]).push(rollupUglify({}, config.format === 'es' ? uglifyEs : uglifyJs));
  }

  const writeOptions: OutputOptions = {
    name: config.name,
    banner: config.banner,
    format: config.format,
    file: config.file,
    globals: config.globals,
    sourcemap: true
  };

  return rollup(bundleOptions).then(bundle => bundle.write(writeOptions));
}
