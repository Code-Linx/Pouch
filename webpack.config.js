const path = require('path');

module.exports = {
  entry: './public/js/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './public/js'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'views'),
    compress: true,
    port: 3000,
    hot: true,
    publicPath: '/js/', // Ensure Webpack knows where to serve files from
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  externals: {
    stripe: 'Stripe', // Add Stripe as an external dependency
  },
  mode: 'development', // Ensure you are in development mode
};
