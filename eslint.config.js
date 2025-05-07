import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Apply eslint-config-prettier (disables conflicting rules)
  eslintConfigPrettier,

  // Your custom configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        // Node.js globals
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // ES2021 globals
        AggregateError: 'readonly',
        FinalizationRegistry: 'readonly',
        WeakRef: 'readonly',
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
        },
      ],
      'no-console': 'warn',
    },
    ignores: ['node_modules', 'dist'],
  },
];
