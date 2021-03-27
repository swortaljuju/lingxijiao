import {WebpackPluginInstance, Compiler} from 'webpack';
import * as pbts from 'protobufjs/cli/pbts';
import * as pbjs from 'protobufjs/cli/pbjs';
import * as path from 'path';
import * as fs from 'fs';


/**
 * Compile all protos in proto/ folder and generate .js and .d.ts
 * files for each proto in the same folder.
 */
export class WebpackProtobufComiplerPlugin implements WebpackPluginInstance {
  public apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tap('WebpackProtobufComiplerPlugin',
        () => {
          const protoFolderPath = path.resolve(__dirname, 'proto');
          fs.readdirSync(
              protoFolderPath)
              .filter((fileName: string) => {
                return path.extname(fileName) == '.proto';
              }).forEach((fileName: string) => {
                const fileBaseName = path.basename(fileName, '.proto');
                const jsFileName = path.join(
                    protoFolderPath, `${fileBaseName}.js`);
                pbjs.main(['-t', 'static-module', '-w', 'commonjs', '-o',
                  jsFileName, path.join(protoFolderPath, fileName)]);
                pbts.main([jsFileName, '-o',
                  path.join(protoFolderPath, `${fileBaseName}.d.ts`)]);
              });
        });
  }
}
