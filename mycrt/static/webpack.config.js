const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = {
    entry:  __dirname + '/index.jsx',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    module: {
      rules: [
        {
          test: /\.jsx?/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: 'css-loader',
          })
      },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Olive Chinos MyCRT'
      }),
      new ExtractTextPlugin('styles.css'),
    ]
};
module.exports = config;
