import {merge} from 'webpack-merge';
import {commonServerConfig, SERVER_OUTPUT_DIR} from './webpack.common';
import * as webpack from 'webpack';
import * as path from 'path';
import CopyPlugin = require('copy-webpack-plugin');

const devServerConfig: webpack.Configuration = merge(commonServerConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'server', '.env.dev'),
          to: path.resolve(SERVER_OUTPUT_DIR, '.env'),
          toType: 'file',
        },
      ],
    }),
  ],
});

export default devServerConfig;
