module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/hooks': './src/hooks',
            '@/contexts': './src/contexts',
            '@/api': './src/api',
            '@/theme': './src/theme',
            '@/utils': './src/utils',
            '@/navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
