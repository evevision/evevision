/**
 * Webpack config for production electron main process
 */

import path from "path";
import webpack from "webpack";
import merge from "webpack-merge";
import baseConfig from "./webpack.config.base";
import CheckNodeEnv from "../scripts/CheckNodeEnv";

CheckNodeEnv("production");

export default merge.smart(baseConfig, {
  devtool: "source-map",

  mode: "production",

  target: "electron-main",

  entry: "./app/main/index.ts",

  output: {
    path: path.join(__dirname, ".."),
    filename: "./app/main-dist/main.prod.js"
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production"
    }),
    new webpack.DefinePlugin({ "global.GENTLY": false })
  ],

  node: {
    __dirname: false,
    __filename: false
  }
});
