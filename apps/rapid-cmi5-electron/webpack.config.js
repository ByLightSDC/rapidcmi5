module.exports = (config) => {
  // Bundle all non-native dependencies
    
  // Optimize for faster builds
  config.optimization = {
    ...config.optimization,
    minimize: false, // Disable minification for faster builds in dev
  };
  
  return config;
};