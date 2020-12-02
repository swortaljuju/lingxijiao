import * as path from 'path';
import * as webpack from 'webpack';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import {WebpackProtobufComiplerPlugin} from './webpack_protobuf_plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { json } from 'express';

export const SERVER_OUTPUT_DIR = path.resolve(__dirname, 'dist', 'server');
export const UI_OUTPUT_DIR = path.resolve(__dirname, 'dist', 'ui');
export const commonServerConfig: webpack.Configuration = {
  entry: path.resolve(__dirname, 'server', 'index.ts'),
  output: {
    path: SERVER_OUTPUT_DIR,
    filename: 'index.js',
  },
  target: 'node',
  name: 'server',
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
    new webpack.DefinePlugin({
      'STATIC_FILE_PATH': JSON.stringify(UI_OUTPUT_DIR),
    }),
  ],
};

export const commonUiConfig: webpack.Configuration = {
  entry: path.resolve(__dirname, 'ui', 'components', 'index.tsx'),
  target: 'web',
  name: 'web',
  output: {
    path: UI_OUTPUT_DIR,
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'ui', 'index.html'),
    }),
    new CleanWebpackPlugin(),
  ],
};
