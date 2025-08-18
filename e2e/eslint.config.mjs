// @ts-check

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        // Don't require project for e2e files
        project: false
      },
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
        Console: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      'no-useless-constructor': 'off',
      'no-unused-expressions': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/no-dupe-class-members': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off'
    },
    linterOptions: {
      reportUnusedDisableDirectives: false
    }
  }
];