const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const serverConfig = {
  target: 'node',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  entry: {
    server: './src/server/server-production.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/dist/',
    filename: 'server.bundle.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/server/index.html', to: 'index.html' },
        { from: 'src/server/index.css', to: 'index.css'}
      ]
    }),
  ],
};

const clientConfig = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  entry: {
    client: './src/client/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/dist/',
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

module.exports = [serverConfig, clientConfig];
