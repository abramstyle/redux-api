const { resolve } = require('path');
// const webpack = require('webpack');

const libName = 'redux-api';

module.exports = {
  entry: {
    [libName]: './index.js',
  },
  externals: {
    '@abramstyle/utils': '@abramstyle/utils',
    'isomorphic-fetch': 'isomorphic-fetch',
    'mime-types': 'mime-types',
    redux: 'redux',
  },
  output: {
    filename: '[name].js',
    path: resolve(__dirname, 'dist'),
    library: libName,
    libraryTarget: 'commonjs2',
  },
  devtool: 'cheap-source-map',
  module: {
    rules: [{
      test: /\.js/,
      exclude: /node_modules/,
      use: [
        'babel-loader',
      ],
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: './fonts/[hash].[ext]',
        },
      },
    }],
  },
};
