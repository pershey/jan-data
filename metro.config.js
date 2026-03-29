const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// wasmファイルをアセットとして扱えるようにする
config.resolver.assetExts.push('wasm');

module.exports = config;
