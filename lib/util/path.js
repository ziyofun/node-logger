"use strict";

const fs = require('fs');
const path = require('path');


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

module.exports = {
    checkAndmkdirsSync
};
