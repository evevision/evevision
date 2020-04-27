/**
 * Build config for electron renderer process
 */

import path from "path";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import merge from "webpack-merge";
import baseConfig from "./webpack.config.base";
import CheckNodeEnv from "../scripts/CheckNodeEnv";

CheckNodeEnv("production");

export default merge.smart(baseConfig, {
  devtool: "source-map",

  mode: "production",

  target: "electron-preload",

  entry: {
    renderer: [path.join(__dirname, "..", "app/renderer/index.tsx")],
    sentry: [path.join(__dirname, "..", "app/renderer/sentry.ts")]
  },

  output: {
    path: path.join(__dirname, "..", "app/renderer-dist"),
    publicPath: "../renderer-dist/",
    filename: "[name].prod.js"
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]"
              },
              sourceMap: true
            }
          }
        ]
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              sourceMap: true
            }
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1
            }
          },
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true,
              debug: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              sourceMap: true
            }
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]"
              },
              importLoaders: 1,
              sourceMap: true
            }
          },
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true,
              debug: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10000,
            mimetype: "application/font-woff"
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 20000,
            mimetype: "font/ttf"
          }
        }
      },
      // OTF Font
      {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 20000,
            mimetype: "font/otf"
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: "url-loader"
      }
    ]
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
      DEBUG_PROD: false
    }),

    new webpack.DefinePlugin({ "global.GENTLY": false }),

    new MiniCssExtractPlugin({
      filename: "style.css"
    })
  ]
});
