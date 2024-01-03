module.exports = {
  'env': {
    'browser': false,
    'commonjs': true,
    'node': true,
    'es2020': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended'
  ],
  'parserOptions': {
    'ecmaVersion': 2020,
    'sourceType': 'module'
  },
  'plugins': [],
  'globals': {
    'process': 'readonly'
  },
  'rules': {
    'no-console': 0,
    'indent': ['error', 2],
    'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
  }
};
