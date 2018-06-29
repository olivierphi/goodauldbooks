// @link https://www.typescriptlang.org/docs/handbook/react-&-webpack.html
// @link https://github.com/smooth-code/error-overlay-webpack-plugin

const ErrorOverlayPlugin = require("error-overlay-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  entry: ["./src/index.tsx"],
  output: {
    path: `${__dirname}/dist`,
    filename: "bundle.js",
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  devServer: {
    contentBase: `${__dirname}/dist`,
    index: "index.html",
    compress: true,
    port: 8000,
    historyApiFallback: true,
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"],
    plugins: [new TsconfigPathsPlugin()],
  },

  plugins: [new ErrorOverlayPlugin()],

  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
};
