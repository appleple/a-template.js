import { readFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

const banner = `/*!
 * a-template v${pkg.version}
 * (c) ${pkg.author}
 * Released under the MIT License.
 */`;

export default defineConfig([
  {
    entry: { index: 'src/index.js' },
    outDir: 'lib',
    format: ['cjs', 'esm'],
    target: 'es2020',
    clean: true,
    sourcemap: false,
    dts: false,
    // esbuild's cjs output keeps `export default` under `.default`;
    // unwrap it so `require('a-template')` returns the class directly.
    footer: ctx => (ctx.format === 'cjs' ? { js: 'module.exports = module.exports.default;' } : undefined),
  },
  {
    entry: { 'a-template': 'src/index.js' },
    outDir: 'build',
    format: ['iife'],
    globalName: 'aTemplate',
    target: 'es2017',
    clean: false,
    minify: false,
    sourcemap: false,
    dts: false,
    banner: { js: banner },
    footer: { js: 'aTemplate = aTemplate.default;' },
    outExtension: () => ({ js: '.js' }),
  },
  {
    entry: { 'a-template.min': 'src/index.js' },
    outDir: 'build',
    format: ['iife'],
    globalName: 'aTemplate',
    target: 'es2017',
    clean: false,
    minify: true,
    sourcemap: false,
    dts: false,
    banner: { js: banner },
    footer: { js: 'aTemplate = aTemplate.default;' },
    outExtension: () => ({ js: '.js' }),
  },
]);
