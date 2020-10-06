module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-restricted-globals': 0,
    'no-restricted-syntax': 0,
    'max-len': 0,
    'no-plusplus': 0,
    'object-curly-newline': 0,
  },
};
