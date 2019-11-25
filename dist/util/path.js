"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var mkdirp = require("mkdirp");
/**
 * 检验文件是否存在，否则创建一个文件夹
 * @param dirname
 * @param mode
 */
function checkAndmkdirsSync(dirname) {
    var fileExistedAlready = fs.existsSync(dirname);
    if (fileExistedAlready) {
        return void 0;
    }
    mkdirp.sync(dirname);
}
exports.checkAndmkdirsSync = checkAndmkdirsSync;
