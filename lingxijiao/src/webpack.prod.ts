import {merge} from 'webpack-merge';
import {commonServerConfig, commonUiConfig} from './webpack.common';
import * as webpack from 'webpack';
import * as path from 'path';
import CopyPlugin = require('copy-webpack-plugin');
import dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(__dirname, 'server', '.env'),
});

const configs: webpack.Configuration[] = [
    merge(
        commonServerConfig(), {
            mode: 'production',
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
        }),
];

export default configs;
