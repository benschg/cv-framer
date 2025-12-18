import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

const eslintConfig = [
  // Ignore files
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      'next-env.d.ts',
      'public/**',
      'AUTOMATE_COMMIT_CHECK/**',
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // Next.js configuration
  ...nextCoreWebVitals,
  ...nextTypescript,

  // Import sorting configuration
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Disable conflicting rules
      'sort-imports': 'off',
      'import/order': 'off',

      // Disable no-undef for TypeScript (TS handles this better)
      'no-undef': 'off',

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Disable base no-unused-vars in favor of TypeScript version
      'no-unused-vars': 'off',
    },
  },

  // Relaxed rules for type definitions and specific directories
  {
    files: ['**/types/**', '**/lib/**', '**/actions/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default eslintConfig;
