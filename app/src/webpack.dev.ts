import {merge} from 'webpack-merge';
import {commonServerConfig, commonUiConfig, SERVER_OUTPUT_DIR} from './webpack.common';
import * as webpack from 'webpack';
import * as path from 'path';
import CopyPlugin = require('copy-webpack-plugin');
import * as dotenv from 'dotenv';

dotenv.config({
    path: path.resolve(__dirname, 'server', '.env.dev'),
});

const configs: webpack.Configuration[] = [merge(commonServerConfig(), {
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
}),
merge(
    commonUiConfig(), {
        mode: 'development',
        devtool: 'inline-source-map',
    }),
];

export default configs;
