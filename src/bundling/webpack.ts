import webpack from 'webpack';
import webpackMerge from 'webpack-merge';

/**
 * Executes webpack using the provided environment options.
 * @param env The environment options to pass to the webpack configuration factory.
 * @param configurationFactory The webpack configuration factory function that generates a webpack config.
 * @param [mergeConfig] Extra webpack configuration objects to provide
 */
export function executeWebpack(env?: Record<string, any>, configurationFactory?: any, mergeConfigs?: any[]): Promise<any> {
  return new Promise(resolve => {
    let config = typeof configurationFactory === 'function' ? configurationFactory(env) : configurationFactory;

    if (mergeConfigs && mergeConfigs.length) {
      config = webpackMerge(config, ...mergeConfigs);
    }

    webpack(config, (err: Error, stats: webpack.Stats) => {
      if (err) {
        throw err;
      }
      resolve(stats);
    });
  });
}
