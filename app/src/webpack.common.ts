import * as path from 'path';
import * as webpack from 'webpack';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import {WebpackProtobufComiplerPlugin} from './webpack_protobuf_plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';


export const SERVER_OUTPUT_DIR = path.resolve(__dirname, '../dist', 'server');
const UI_DIST_PATH = 'ui';
export const UI_OUTPUT_DIR = path.resolve(__dirname, '../dist', UI_DIST_PATH);
const postBackgroundsFolder = 'post_backgrounds';
const tutorialScreenshotsFolder = 'tutorial_screenshots';
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
        // Nodejieba is not compatible with webpack and will throw error in both build time and runtime.
        // So instead of building it into index.js, just leave it in node_modules/ and import it as an
        // external library.
        externals: {'nodejieba': 'commonjs nodejieba'},
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new WebpackProtobufComiplerPlugin(),
            new webpack.DefinePlugin({
                'UI_DIST_PATH': JSON.stringify(UI_DIST_PATH),
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'server', 'resources'),
                        to: SERVER_OUTPUT_DIR,
                        toType: 'dir',
                    },
                ],
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
            extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.scss'],
        },
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        'sass-loader',
                    ],
                },
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
                'POST_BACKGROUNDS_FOLDER': JSON.stringify(postBackgroundsFolder),
                'TUTORIAL_SCREENSHOTS_FOLDER': JSON.stringify(tutorialScreenshotsFolder),
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
                    {
                        from: path.resolve(__dirname, 'ui', 'post_backgrounds'),
                        to: path.resolve(UI_OUTPUT_DIR, postBackgroundsFolder),
                        toType: 'dir',
                    },
                    {
                        from: path.resolve(__dirname, 'ui', 'tutorial_screenshots'),
                        to: path.resolve(UI_OUTPUT_DIR, tutorialScreenshotsFolder),
                        toType: 'dir',
                    },
                ],
            }),
            new MiniCssExtractPlugin(),
        ],
    };
}
