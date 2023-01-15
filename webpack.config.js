const webpack = require('webpack')
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );

module.exports = {
	//mode: 'production',
	mode: 'development',
	context: __dirname + "/src",
	entry: './js/index.ts',
	output: {
		filename: 'uits.js',
		assetModuleFilename: 'assets/[name][ext]'
	},
    devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader'
			},
			{
                test: /\.(svg|png|jpe?g)$/i,
                type: 'asset/resource',
			},
			{
				test: /\.json/,
				type: 'asset/resource',
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
		alias: {
			"@images": __dirname + "/src/assets/images",
			"@texts": __dirname + "/src/assets/texts",
			"~": __dirname + "/src/js",
		},
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
