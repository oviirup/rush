import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import ts from 'typescript-eslint';

/** @type {import('eslint').Linter.Config} */
export default [
  prettier,
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  {
    plugins: { onlyWarn },
    rules: {
      'semi': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'eqeqeq': 'warn',
    },
  },
  {
    ignores: ['eslint.config.js', 'dist/**'],
  },
];
