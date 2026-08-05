import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // examples/*.js are template-text fixtures (not real JS) fetched by the
    // demo HTML pages, not source to lint.
    ignores: ['lib/**', 'build/**', 'node_modules/**', 'coverage/**', 'examples/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // Unicode ranges in these regex character classes use defensive
      // backslash-escapes; not worth the risk of touching them.
      'no-useless-escape': 'off'
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
