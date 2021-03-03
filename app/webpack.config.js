const path = require('path');

module.exports = {
  entry: './static/js/script.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'static/dist'),
  },
};
