import {merge} from 'webpack-merge';
import {commonConfig} from './webpack.common';
import * as webpack from 'webpack';
import * as path from 'path';
import CopyPlugin = require('copy-webpack-plugin');

const prodConfig: webpack.Configuration = merge(commonConfig, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        path.resolve(__dirname, 'server', '.env'),
      ],
    }),
  ],
});

export default prodConfig;
