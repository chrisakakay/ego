module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 2020,
    'sourceType': 'module'
  },
  'plugins': [
    'react',
    'import'
  ],
  'globals': {
    'process': 'readonly'
  },
  'rules': {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'react/prop-types': 0,
    'import/no-named-as-default': 0,
  },
  'settings': {
    'import/extensions': ['.js', '.jsx'],
    'react': {
      'version': '18.2'
    }
  }
};
