const path = require('path');

module.exports = {
    entry: './src/admin/App.js',
    output: {
        path: path.resolve(__dirname, 'js'),
        filename: 'admin.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env']
                    }
                }
            }
        ]
    }
};