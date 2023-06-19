//create eslint.config.js file
module.exports = {
    extends: ['airbnb-base', 'prettier'],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: 'next',
        },
      ],
    },
  };