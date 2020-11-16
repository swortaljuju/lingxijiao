import {merge} from 'webpack-merge';
import {commonConfig, OUTPUT_DIR} from './webpack.common';
import * as webpack from 'webpack';
import * as path from 'path';
import CopyPlugin = require('copy-webpack-plugin');

const devConfig: webpack.Configuration = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '.env.dev'),
          to: path.resolve(OUTPUT_DIR, '.env'),
          toType: 'file',
        },
      ],
    }),
  ],
});

export default devConfig;
