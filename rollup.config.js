import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

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
      resolve(),
      commonjs()
    ]
  },
  {
    input: 'src/webview/index.tsx',
    output: {
      file: 'dist/webview/index.js',
      format: 'iife',
      name: 'webview'
    },
    plugins: [
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
        browser: true
      }),
      commonjs(),
    ]
  }
];