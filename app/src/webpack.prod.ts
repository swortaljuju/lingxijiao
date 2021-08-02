import {merge} from 'webpack-merge';
import {commonServerConfig, commonUiConfig} from './webpack.common';
import * as webpack from 'webpack';
import * as path from 'path';
import CopyPlugin = require('copy-webpack-plugin');
import * as dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(__dirname, 'server', '.env'),
});

const configs: webpack.Configuration[] = [
    merge(
        commonServerConfig(), {
            mode: 'production',
            devtool: 'source-map',
            optimization: {
                // Minization could cause problem in Typegoose which relies on reflection.
                minimize: false,
            },
            plugins: [
                new CopyPlugin({
                    patterns: [
                        path.resolve(__dirname, 'server', '.env'),
                    ],
                }),
            ],
        }),
    merge(
        commonUiConfig(), {
            mode: 'production',
            devtool: 'source-map',
        }),
];

export default configs;
