var path = require("path");
module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "wcs.min.js",
    library: "wcs",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, "src")],
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.js$/,
        enforce: "post",
        loader: "es3ify-loader",
        exclude: /node_modules/
      }
    ]
  }
};
