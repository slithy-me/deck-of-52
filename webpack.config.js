const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, 'examples/src/index.html'),
  filename: './index.html'
})

module.exports = {
  entry: path.join(__dirname, 'examples/src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [
    htmlWebpackPlugin,
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss']
  },
  devServer: {
    port: 3001
  }
}
