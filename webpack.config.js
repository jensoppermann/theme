const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

// Bestimmen, ob wir im Produktionsmodus sind
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    mode: isProduction ? 'production' : 'development',
    entry: [
        './src/js/all.js'
    ],
    output: {
        filename: 'all.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'window',
    },
    resolve: {
        extensions: [ ".css", ".scss", ".js", ".json" ],
        modules: [ "node_modules" ],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [ '@babel/preset-env' ]
                    }
                }
            },
        ]
    },
    optimization: isProduction ? {
        minimize: true,
        minimizer: [ new TerserPlugin({
            terserOptions: {
                keep_fnames: true,
                keep_classnames: true
            }
        }) ],
    } : {},
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
    ]
};
