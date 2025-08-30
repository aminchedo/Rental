const { ESLint } = require('eslint');

module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'client/',
    'server/',
    'src/',
    '.wrangler/',
    'Rental/'
  ]
}