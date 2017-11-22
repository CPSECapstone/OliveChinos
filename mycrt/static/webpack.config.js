const webpack = require('webpack');
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
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Olive Chinos MyCRT'
      })
    ]
};
module.exports = config;
