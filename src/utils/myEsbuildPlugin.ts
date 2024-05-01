import esbuild from 'esbuild';
import { ICypressConfiguration } from '../../node_modules/@badeball/cypress-cucumber-preprocessor/dist/subpath-entrypoints/esbuild';
import { compile } from '../../node_modules/@badeball/cypress-cucumber-preprocessor/dist/template';

export type IPlugin = (content: string) => Promise<string>;
function getPluginContent(content: string, plugins?: IPlugin[]): Promise<string> {
  if (!plugins) {
    return Promise.resolve(content);
  }
  return plugins.reduce(async (acc, plugin) => {
    return plugin(await acc);
  }, Promise.resolve(content));
}

export default function myEsbuildPlugin(
  configuration: ICypressConfiguration,
  plugins?: IPlugin[]
): esbuild.Plugin {
  return {
    name: 'feature',
    setup(build) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require("fs") as typeof import("fs");

      build.onLoad({ filter: /\.feature$/ }, async (args) => {
        const originalContent = await fs.promises.readFile(args.path, 'utf8');
        const content = await getPluginContent(originalContent, plugins);
        return {
          contents: await compile(configuration, content, args.path),
          loader: 'js',
        };
      });
    },
  };
}
