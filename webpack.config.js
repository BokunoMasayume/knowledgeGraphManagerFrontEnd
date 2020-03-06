const path = require('path');

module.exports = {
    mode:"development",
    entry: './static/js/src/main.js',

    output:{
        filename: 'bundle.js',
        path: path.resolve(__dirname , './static/js/build')
    },


    module:{
        rules:[
            {
                test: /\.js$/,
                use:{
                    loader:"babel-loader",
                    options:{
                        presets:["@babel/preset-env"]
                    }
                },
                exclude:/node_modules/
            }
        ]
    },
};