"use strict";

const fs = require('fs');
const path = require('path');


function mkdirsSync(dirname, mode) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}

module.exports = {
    mkdirsSync
};
