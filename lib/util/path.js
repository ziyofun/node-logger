"use strict";


const fs = require('fs');
const Promise = require("bluebird");
Promise.config({
    cancellation: true
});

const mkdirp = Promise.promisify(require('mkdirp'));


async function checkAndmkdirsSync(dirname, mode) {
    
    let isExists = await fs.existsSync(dirname);
    if (isExists) {
        return Promise.resolve(true);
    }
    
    let opts = {};
    opts.mode = mode;
    
    return new Promise((resolve, reject) => {
        mkdirp(dirname, opts)
            .then((res) => {
                resolve(true)
            }, (err) => {
                console.log(`mkdirp ${dirname} err:`, JSON.stringify(err));
                reject(false);
            })
    });
}

module.exports = {
    checkAndmkdirsSync,
};
