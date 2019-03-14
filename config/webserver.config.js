const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const cssFilename = 'static/css/[name].[contenthash:8].css'
const CleanWebpackPlugin = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const serverConfig = {
  context: path.resolve(__dirname, '..'),
  entry: { server: './server/server' },
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, '../build/server'),
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/chunk.[name].js'
  },
  // target: 'node' 指明构建出的代码是要运行在node环境里.
  // 不把 Node.js 内置的模块打包进输出文件中，例如 fs net 模块等
  target: 'node',
  //指定在node环境中是否要这些模块
  node: {
    __filename: true,
    __dirname: true
    // module:true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader?cacheDirectory=true',
        options: {
          presets: ['react-app'],
          plugins: [
            'add-module-exports',
            [
              'import',
              {
                libraryName: 'antd-mobile',
                style: 'css'
              }
            ]
          ]
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules|antd-mobile\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          }
        ]
      },
      {
        test: /\.css$/,
        include: /node_modules|antd-mobile\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif|webp)$/,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.json$/i,
        type: 'javascript/auto',
        loader: 'json-loader'
      }
    ]
  },
  // 不把 node_modules 目录下的第三方模块打包进输出文件中,
  externals: [nodeExternals()],
  resolve: { extensions: ['*', '.js', '.json', '.scss'] },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    //分离css文件
    new MiniCssExtractPlugin({
      filename: cssFilename
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}

module.exports = serverConfig
