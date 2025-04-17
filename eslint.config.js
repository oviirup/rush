const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const onlyWarn = require('eslint-plugin-only-warn');
const ts = require('typescript-eslint');

/** @type {import('eslint').Linter.Config} */
module.exports = [
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
      'no-console': ['warn', { allow: ['error', 'warn'] }],
    },
  },
  {
    ignores: ['eslint.config.js', 'node_modules', 'dist'],
  },
];
