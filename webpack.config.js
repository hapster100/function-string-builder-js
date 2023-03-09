const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.pug', 'styl']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.min.js'
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react']
          }
        }, 'pug-as-jsx-loader'],
      },
      { 
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader'
          }
        ]
      },
      {
        test: /\.jsx?$/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env', '@babel/react']
          }
        }]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'stylus-loader'
        ]
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './public/index.html'
    })
  ]
}