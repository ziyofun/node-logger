"use strict";

const fs = require('fs');
const path = require('path');
const Promise = require("bluebird");
// const mkdirp = require('mkdirp');

const mkdirp = Promise.promisify(require('mkdirp'));

/*
mkdirp('/tmp/foo/bar/baz', function (err) {
    if (err) console.error(err)
    else console.log('pow!')
});
*/
mkdirp('/tmp/foo/bar/baz')
    .then(res => {
        console.log('pow!')
    }, err => {
        console.error(err)
    })


let dirname = "./lzy/lzy2/lzy3";
console.log(path.dirname(dirname));


/*
function checkAndmkdirsSync(dirname, mode) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (checkAndmkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}
 */