"use strict";

const fs = require('fs');
const path = require('path');
const Promise = require("bluebird");
Promise.config({
    cancellation: true
});
const mkdirp = Promise.promisify(require('mkdirp'));

/*
function checkAndmkdirsSync(dirname, mode) {
    if (fs.existsSync(dirname)) {
        return true;
    }
    else {
        if (checkAndmkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}
*/


async function checkAndmkdirsSync(dirname, mode) {
    if (fs.existsSync(dirname)) {
        return Promise.resolve(true);
    }
    else {
        let opts = {};
        opts.mode = mode;
        
        return new Promise((resolve, reject) => {
            mkdirp(dirname, opts)
                .then(res => {
                    resolve(true)
                }, err => {
                    console.log(`mkdirp ${dirname} err:`, JSON.stringify(err));
                    reject(false);
                })
        })
    }
}

module.exports = {
    checkAndmkdirsSync
};
