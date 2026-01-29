import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    // svelte/** is ignored because the Svelte project has its own ESLint config
    // (svelte/eslint.config.js) with svelte-specific plugins and parser settings.
    ignores: ['dist/**', 'node_modules/**', 'react/.next', 'svelte/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        React: 'readonly',
        // Next.js injects `process.env` at build time for NEXT_PUBLIC_* vars
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-console': 'warn',
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: [
      '**/middleware.ts',
      '**/supabase/server.ts',
      '**/route.ts',
      '*.config.{js,mjs,ts}',
      '**/vitest.config.ts',
      'eslint.config.mjs',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    rules: {
      'no-unused-vars': 'error',
    },
  },
];
