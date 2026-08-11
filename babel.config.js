module.exports = {
  presets: ['module:@react-native/babel-preset'],

  plugins: [
    '@babel/plugin-transform-export-namespace-from',

    [
      'module-resolver',
      {
        alias: {
          '@': './src',
          '@app': './src/app',
          '@config': './src/config',
          '@constants': './src/constants',
          '@theme': './src/theme',
          '@assets': './src/assets',
          '@shared': './src/shared',
          '@api': './src/api',
          '@services': './src/services',
          '@store': './src/store',
          '@rbac': './src/rbac',
          '@navigation': './src/navigation',
          '@types': './src/types',
          '@features': './src/features',
          '@components': './src/components',
        },
      },
    ],

    'react-native-worklets/plugin',
  ],
};