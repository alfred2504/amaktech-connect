import { defineConfig, globalIgnores } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: process.cwd() });

export default defineConfig([
  ...compat.extends(
    'eslint-config-next/core-web-vitals.js',
    'eslint-config-next/typescript.js',
  ),
  globalIgnores(['.next/**', 'node_modules/**', 'app/page *']),
]);
