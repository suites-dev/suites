// @ts-check

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import tsdoc from 'eslint-plugin-tsdoc';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/*', 'coverage/*', 'dist', 'dist/*', '*.js', '*.d.ts', 'index.ts'],
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: true,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        Console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      tsdoc,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      'no-useless-constructor': 'off',
      'no-unused-expressions': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-dupe-class-members': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      'tsdoc/syntax': 'error',
    },
  },
];
