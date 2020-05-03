/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import path from "path";
import webpack from "webpack";
import merge from "webpack-merge";
import { spawn } from "child_process";
import baseConfig from "./webpack.config.base";
import CheckNodeEnv from "../scripts/CheckNodeEnv";

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === "production") {
  CheckNodeEnv("development");
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const rendererOutput = path.join(__dirname, "..", "output", "renderer-lib");
const manifest = path.resolve(rendererOutput, "renderer.json");
const requiredByLibConfig = module.parent.filename.includes(
  "webpack.config.renderer.dev.lib"
);

export default merge.smart(baseConfig, {
  devtool: "inline-source-map",

  mode: "development",

  target: "electron-renderer",

  entry: [
    ...(process.env.PLAIN_HMR ? [] : ["react-hot-loader/patch"]),
    `webpack-dev-server/client?http://localhost:${port}/`,
    "webpack/hot/only-dev-server",
    require.resolve("../app/renderer/index.tsx"),
  ],

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: "renderer.dev.js",
  },

  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: "style-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
              sourceMap: true,
              importLoaders: 1,
            },
          },
        ],
      },
      // SASS support - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff",
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: "url-loader",
      },
    ],
  },
  resolve: {
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
  },
  plugins: [
    requiredByLibConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: path.join(__dirname, "..", "output", "renderer-lib"),
          manifest: require(manifest),
          sourceType: "var",
        }),

    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: true,
    stats: "errors-only",
    inline: true,
    lazy: false,
    hot: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    contentBase: path.join(__dirname, "dist"),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    before() {
      if (process.env.START_HOT) {
        console.log("Starting main process...");
        spawn(
          "electron",
          ["-r", "./scripts/BabelRegister", "./app/main/index.ts"],
          {
            shell: true,
            env: process.env,
            stdio: "inherit",
          }
        )
          .on("exit", (code) => {
            console.log("Main process exited, code", code);
            process.exit(code);
          })
          .on("error", (spawnError) => console.error(spawnError));
      }
    },
  },
});
