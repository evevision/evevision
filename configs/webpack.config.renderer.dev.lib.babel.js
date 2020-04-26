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

const dist = path.join(__dirname, "..", "app", "renderer");

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

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development"
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: path.join(__dirname, "..", "app", "renderer"),
        output: {
          path: path.join(__dirname, "..", "app", "renderer")
        }
      }
    })
  ]
});
