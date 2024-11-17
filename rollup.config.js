import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import postcss from "rollup-plugin-postcss";
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
    {
        input: 'src/extension.ts',
        output: {
            file: 'dist/extension.js',
            format: 'commonjs',
            sourcemap: true
        },
        external: ['vscode'], // Keep vscode external for the extension
        plugins: [
            typescript({
                tsconfig: false,
                compilerOptions: {
                    module: 'esnext',
                    target: 'es2020',
                    sourceMap: true,
                    moduleResolution: 'node'
                }
            }),
            postcss({
                extract: true,
                minimize: true,
            }),
            resolve(),
            commonjs()
        ]
    },
    {
        input: 'src/webview/index.tsx',
        output: {
            file: 'dist/webview/index.js',
            name: 'webview',
            format: 'iife',
        },
        external: [/\.css$/],
        plugins: [
            alias({
                entries: [
                  { find: '@', replacement: path.resolve(__dirname, 'src', 'webview') }
                ]
              }),
            typescript({
                tsconfig: false,
                compilerOptions: {
                    jsx: 'react',
                    module: 'esnext',
                    target: 'es2020',
                    sourceMap: true,
                    moduleResolution: 'node',
                    lib: ['DOM', 'ES2020']
                }
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
                preventAssignment: true
            }),
            resolve({
                browser: true,
                extensions: ['.js', '.jsx', '.ts', '.tsx']
            }),
            commonjs(),
        ]
    },
    {
        input: "src/webview/styles/globals.css",
        output: [{ file: "dist/webview/styles/globals.css", format: "es" }],
        plugins: [
            postcss({
                extract: true,
                minimize: true,
            }),
        ],
    },

];