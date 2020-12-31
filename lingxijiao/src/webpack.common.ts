import * as path from 'path';
import * as webpack from 'webpack';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import {WebpackProtobufComiplerPlugin} from './webpack_protobuf_plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin = require('copy-webpack-plugin');

export const SERVER_OUTPUT_DIR = path.resolve(__dirname, '../dist', 'server');
export const UI_OUTPUT_DIR = path.resolve(__dirname, '../dist', 'ui');
// Define the config as a function so that environment specific config file could set 
// process.env which is used here.
export function commonServerConfig(): webpack.Configuration {
    return {
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
            new CleanWebpackPlugin(),
            new WebpackProtobufComiplerPlugin(),
            new webpack.DefinePlugin({
                'STATIC_FILE_PATH': JSON.stringify(UI_OUTPUT_DIR),
            }),
        ],
    };
}

export function commonUiConfig(): webpack.Configuration {
    return {
        entry: path.resolve(__dirname, 'ui', 'index.tsx'),
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
            new CleanWebpackPlugin(),
            new webpack.DefinePlugin({
                'MAX_NUMBER_POST_PER_PERIOD': (process.env.MAX_NUMBER_POST_PER_PERIOD as string),
                'MAX_NUMBER_RESPONSE_PER_PERIOD': (process.env.MAX_NUMBER_RESPONSE_PER_PERIOD as string),
                'PERIOD_DAYS_FOR_MAX_NUMBER_CHECK': (process.env.PERIOD_DAYS_FOR_MAX_NUMBER_CHECK as string),
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'ui', 'index.html'),
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'ui', 'i18n', 'locales'),
                        to: UI_OUTPUT_DIR,
                        toType: 'dir',
                    },
                ],
            }),
        ],
    };
}