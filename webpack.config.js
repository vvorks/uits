const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const webpack = require('webpack')

module.exports = {
	//mode: 'production',
	mode: 'development',
	context: __dirname + "/src",
	entry: './js/index.ts',
	output: {
		//path: __dirname + '/dist',
		filename: 'uits.js'
	},
    devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader'
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
		fallback: {
			path: require.resolve("path-browserify"),
			process: require.resolve("process"),
			fs: false,
		},
	},
	plugins: [
		new HtmlWebpackPlugin({template: "./html/index.html"}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	],
	devServer: {
		static: {
			// 公開ディレクトリの指定
			directory: __dirname + '/dist',
		},
		// ポート番号の指定
		port: 8080
	}
};
