const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/openmrs-esm-api.ts"),
  output: {
    filename: "openmrs-esm-api.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "system"
  },
  devtool: "sourcemap",
  module: {
    rules: [
      {
        test: /\.(j|t)s$/,
        exclude: /node_modules/,
        use: "babel-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  plugins: [new CleanWebpackPlugin(), new ForkTsCheckerWebpackPlugin()],
  externals: [],
  devServer: {
    disableHostCheck: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
};
