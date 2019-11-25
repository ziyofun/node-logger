"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var path = require('path');
var loggerWithoutName;
/**
 * require('./log')(name)
 *
 * @return {Function} log
 */
function Logger(options) {
    return function (name) {
        if (!name) {
            throw new Error('logger name is required');
        }
        if (name) {
            name = path.basename(name, path.extname(name));
        }
        if (!loggerWithoutName) {
            // 利用此options生成logger实例
            options.name = name;
            options.datePattern = options.datePattern || 'YYYY-MM-DD-';
            if (options.writeFile && !options.dir) {
                throw new Error('config.logger.dir is required');
            }
            // createLogger返回一个以模块名为参数的方法，调用此方法即可获得一个logger‘实例’
            loggerWithoutName = logger_1.createLogger(options);
        }
        // 公用logger实例，但各自通过闭包封装输出配置
        return loggerWithoutName(name);
    };
}
exports.Logger = Logger;
;
var logger_2 = require("./logger");
exports.genTraceId = logger_2.genTraceId;
exports.getTraceId = logger_2.getTraceId;
exports.setTraceId = logger_2.setTraceId;
exports.ns = logger_2.writer;
