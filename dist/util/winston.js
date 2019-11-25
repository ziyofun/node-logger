"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var DailyRotateFile = require("winston-daily-rotate-file");
var fast_safe_stringify_1 = require("fast-safe-stringify");
var moment = require("moment");
var os = require("os");
// 格式化输出，用于输出到文件
var loggerFormat = winston_1.format.printf(function (options) {
    var timestamp = moment().toISOString(true);
    // 处理多行message
    var message = options.message ? options.message.replace(/\r\n|\r|\n/g, os.EOL + " | ") : options.message;
    return "+ " + timestamp + " " + options.level.toUpperCase() + " " + message;
});
var instanceMapping = new Map();
// 工具函数，传入配置，返回一个winston实例
function createWinston(options) {
    // 相同配置返回同一实例
    var optionString = fast_safe_stringify_1.default(options);
    if (instanceMapping.has(optionString)) {
        return instanceMapping.get(optionString);
    }
    var datePattern = options.datePattern || 'YYYYMMDD-';
    var filename = options.filename + "%DATE%";
    /** 通过不同的配置决定输出流 */
    var transports = [];
    // 写文件
    if (options.writeFile) {
        transports.push(new DailyRotateFile({
            dirname: options.dir,
            filename: filename + ".log",
            datePattern: datePattern,
            json: false,
            level: options.level,
            maxSize: '100m',
            format: loggerFormat,
        }));
    }
    // 输出到屏幕
    if (options.console) {
        transports.push(new winston_1.transports.Console({
            level: options.level,
            format: loggerFormat
        }));
    }
    // 错误日志另行输出到错误日志
    if (options.needErrorFile) {
        transports.push(new DailyRotateFile({
            dirname: options.dir,
            filename: filename + "-error.log",
            datePattern: datePattern,
            json: false,
            level: 'error',
            format: loggerFormat,
        }));
    }
    // winston实例
    var instance = winston_1.createLogger({
        transports: transports,
        exitOnError: false
    });
    instanceMapping.set(optionString, instance);
    return instance;
}
exports.createWinston = createWinston;
