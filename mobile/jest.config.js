module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // Estas librerías se publican como ES modules: Jest las tiene que transformar
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-native-vector-icons|@react-navigation|@emotion|react-native-screens|react-native-safe-area-context)/)',
  ],
};
