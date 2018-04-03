const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// @link https://github.com/webpack-contrib/mini-css-extract-plugin

module.exports = {
  entry: ["./scss/index.scss"],
  output: {
    path: `${__dirname}/dist`,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],
};
