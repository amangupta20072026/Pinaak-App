const reactNativeConfig = require('@react-native/eslint-config/flat');
const importX = require('eslint-plugin-import-x');
const { createTypeScriptImportResolver } = require('eslint-import-resolver-typescript');

module.exports = [
  ...reactNativeConfig,
  importX.flatConfigs.recommended,
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'coverage/**'],
  },
  {
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: './tsconfig.json',
          alwaysTryTypes: true,
        }),
      ],
    },
    rules: {
      // TypeScript (tsc) already validates exports/imports with full type
      // awareness. These two rules re-parse imported source files instead —
      // react-native's own source is Flow-typed, which breaks them.
      'import-x/namespace': 'off',
      'import-x/named': 'off',

      // Flow-type rules: not used, this project is TypeScript.
      'ft-flow/define-flow-type': 'off',
      'ft-flow/use-flow-type': 'off',
    },
  },
];