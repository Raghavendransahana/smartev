const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enhanced configuration for better connectivity
config.server = {
  ...config.server,
  port: 8081,
  // Enable rewriting requests for better mobile connectivity
  rewriteRequestUrl: (url) => {
    // Handle localhost rewriting for mobile devices
    if (url.includes('localhost')) {
      return url.replace('localhost', '127.0.0.1');
    }
    return url;
  }
};

// Better resolver configuration
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'bin'],
};

module.exports = config;
