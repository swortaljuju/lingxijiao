import * as path from 'path';
import * as webpack from 'webpack';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import {WebpackProtobufComiplerPlugin} from './webpack_protobuf_plugin';

export const OUTPUT_DIR = path.resolve(__dirname, 'dist');
export const commonConfig: webpack.Configuration = {
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  output: {
    path: OUTPUT_DIR,
    filename: 'index.js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new WebpackProtobufComiplerPlugin(),
    new CleanWebpackPlugin(),
  ],
};
