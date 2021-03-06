const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const isDev = process.argv[1].indexOf('webpack-dev-server') >= 0;

// const Visualizer = require('webpack-visualizer-plugin'); // remove it in production environment.
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // remove it in production environment.

// const otherPlugins = process.argv[1].indexOf('webpack-dev-server') >= 0 ? [] : [
//   new Visualizer(), // remove it in production environment.
//   new BundleAnalyzerPlugin({
//     defaultSizes: 'parsed',
//     // generateStatsFile: true,
//     statsOptions: { source: false }
//   }), // remove it in production environment.
// ];

const postcssOpts = {
  ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
  plugins: () => [
    autoprefixer({
      browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
    }),
    // pxtorem({ rootValue: 100, propWhiteList: [] })
  ],
};

const config = {
  devtool: isDev ? 'source-map' : '', // or 'inline-source-map'
  devServer: {
    disableHostCheck: true,
    hot: false, // stop auto refresh
    inline: false, // stop auto refresh
  },

  entry: {
    "index": path.resolve(__dirname, 'src/pages/index/index'),
    "options": path.resolve(__dirname, 'src/pages/options/index'),
    "background": path.resolve(__dirname, 'src/pages/background/index'),
  },

  output: {
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    path: path.join(__dirname, '/gate-ticker/dist'),
    publicPath: '/dist/'
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), path.join(__dirname, 'src')],
    extensions: ['.web.js', '.jsx', '.js', '.json'],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader',
        options: {
          plugins: [
            'external-helpers', // why not work?
            ["transform-runtime", { polyfill: false }],
            // ["import", [{ "style": "css", "libraryName": "antd-mobile" }]] // todo::怎么移到页面 css 后面加载
          ],
          presets: ['es2015', 'stage-0', 'react']
          // presets: [['es2015', { modules: false }], 'stage-0', 'react'] // tree-shaking
        }
      },
      { test: /\.(jpg|png)$/, loader: "url-loader?limit=8192" },
      // 注意：如下不使用 ExtractTextPlugin 的写法，不能单独 build 出 css 文件
      // { test: /\.scss$/i, loaders: ['style-loader', 'css-loader', 'sass-loader'] },
      // { test: /\.css$/i, loaders: ['style-loader', 'css-loader'] },
      {
        test: /\.scss$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', { loader: 'postcss-loader', options: postcssOpts }, 'sass-loader'
          ]
        })
      },
      {
        test: /\.css$/i, use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader', { loader: 'postcss-loader', options: postcssOpts }
          ]
        })
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      // minChunks: 2,
      name: 'shared',
      filename: 'shared.js'
    }),
    new ExtractTextPlugin({ filename: '[name].css', allChunks: true }),
    // ...otherPlugins
  ],
};

module.exports = config;
