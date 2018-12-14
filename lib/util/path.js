"use strict";


const fs = require('fs');
const mkdirp = require('mkdirp');

function checkAndmkdirsSync(dirname, mode) {
    let fileExistedAlready = fs.existsSync(dirname);
    if (fileExistedAlready) {
        return void 0;
    }
    
    let opts = {};
    opts.mode = mode;
    
    mkdirp.sync(dirname, opts)
}

module.exports = checkAndmkdirsSync;
