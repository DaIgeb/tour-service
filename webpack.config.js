var path = require('path');
const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Helper functions
var ROOT = path.resolve(__dirname, '..');

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [ROOT].concat(args));
}

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  externals: ["aws-sdk", "formidable"], // modules to be excluded from bundled file
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules:  [
      root('src'),
      'node_modules'
    ]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'string-replace-loader',
        query: {
          search: '(System|SystemJS)(.*[\\n\\r]\\s*\\.|\\.)import\\((.+)\\)',
          replace: '$1.import($3).then(mod => mod.__esModule ? mod.default : mod)',
          flags: 'g'
        },
        enforce: "pre",
        include: [root('src')]
      },
      {
        test: /\.ts$/,
        loaders: [
          'ts-loader'
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'node_modules/formidable/**/*'
      }
    ]),
  ]
};