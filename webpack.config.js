const path = require('path');

module.exports = {
    mode:"development",
    entry: './jstest/main.js',

    output:{
        filename: 'bundle.js',
        path: path.resolve(__dirname , './jstest')
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