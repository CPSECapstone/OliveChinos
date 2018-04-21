const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = {
    entry:  __dirname + '/index.jsx',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js',
    },
    devtool: "#eval-source-map",
    devServer: {
      contentBase: 'dist',
      //hot: true,
      proxy: {
        '/api/*': {
          target: 'http://localhost:5000',
        },
      }
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
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ]
      },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Olive Chinos MyCRT'
      }),
      new MiniCssExtractPlugin({filename: 'styles.css'}),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.LoaderOptionsPlugin({
       debug: true
     })

    ]
};
module.exports = config;
