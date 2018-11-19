var merge = require("webpack-merge");
var path = require("path");
var webpack = require("webpack");
var common = require("./webpack.common.js");
module.exports = merge(common, {
  devtool: 'inline-source-map',
  plugins:[],
  devServer: {
    port:"80",
    disableHostCheck: true,
    progress: true,
    proxy: {
      "/getUploadToken": {
        target: "http://localhost:9000",
        changeOrigin: true,
        secure: false
      }
    },
    contentBase: path.join(__dirname, "./"),
    publicPath: "/dist/",
    hot: false,
    inline: false
  }
});
