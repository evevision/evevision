/**
 * Builds the lib for development electron renderer process
 * normally the resulting file is called a 'dll', but I called it a 'lib' to not confuse things with the overlay dll.
 */

import webpack from "webpack";
import path from "path";
import merge from "webpack-merge";
import baseConfig from "./webpack.config.base";
import { dependencies } from "../package.json";
import CheckNodeEnv from "../scripts/CheckNodeEnv";

CheckNodeEnv("development");

const dist = path.join(__dirname, "..", "output", "renderer-lib");

export default merge.smart(baseConfig, {
  context: path.join(__dirname, ".."),

  devtool: "eval",

  mode: "development",

  target: "electron-renderer",

  externals: ["fsevents", "crypto-browserify"],

  /**
   * Use `module` from `webpack.config.renderer.dev.js`
   */
  module: require("./webpack.config.renderer.dev.babel").default.module,

  entry: {
    renderer: Object.keys(dependencies || {})
  },

  output: {
    library: "renderer",
    path: dist,
    filename: "[name].dev.lib.js",
    libraryTarget: "var"
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, "[name].json"),
      name: "[name]"
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: "development"
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: path.join(__dirname, "..", "app", "renderer"),
        output: {
          path: path.join(__dirname, "..", "output", "renderer-lib")
        }
      }
    })
  ]
});
