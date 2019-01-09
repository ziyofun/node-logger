'use strict';


const winston = require('winston');
const {
    createLogger,
    format: {
        printf,
        timestamp
    }
} = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const stringify = require('fast-safe-stringify');
const moment = require('moment');
const os = require('os');

let globalTransports = {};

// 格式化输出，用于输出到文件
const loggerFormat = printf(options => {
    const timestamp = moment().toISOString(true);

    // 处理多行message
    let message = options.message ? options.message.replace(/\r\n|\r|\n/g, `${os.EOL} | `) : options.message;

    let meta = this.meta;
    let metaStr = '';
    if (meta) {

        if (meta instanceof Error) {
            meta = format(meta)
        }

        metaStr = stringify(meta);
    }

    return `+ ${timestamp} ${options.level.toUpperCase()} ${message} ${metaStr}`;
});

// 格式化输出，用于输出到屏幕，可通过console: false关闭
const colorFormat = printf(options => {
    const timestamp = moment().format();

    // 处理多行message
    let message = options.message ? options.message.replace(/\r\n|\r|\n/g, `${os.EOL} | `) : options.message;

    let meta = this.meta;
    let metaStr = '';
    if (meta) {

        if (meta instanceof Error) {
            meta = format(meta)
        }

        metaStr = stringify(meta);
    }

    return `+ ${timestamp} ${options.level.toUpperCase()} ${message} ${metaStr}`;
});

// 工具函数，传入配置，返回一个winston实例
function Winston(options) {
    let datePattern;
    if (options.datePattern !== undefined) {
        datePattern = options.datePattern;
    } else {
        datePattern = 'YYYYMMDD-';
    }

    let isDatePrefix;
    if (options.hasOwnProperty('isDatePrefix') && options.isDatePrefix === false) {
        isDatePrefix = options.isDatePrefix;
    } else {
        isDatePrefix = true;
    }

    let filename;
    if (isDatePrefix === true) {
        filename = `%DATE%${options.filename}`;
    } else {
        filename = `${options.filename}%DATE%`;
    }

    globalTransports[options.name] = [];

    /** 通过不同的配置决定输出流 */

    // 写文件
    if (!options.writeFile) {
        let appTransport = new DailyRotateFile({
            localTime: true,
            name: `${options.name}`,
            dirname: options.dir,
            filename: `${filename}.log`,
            datePattern: datePattern,
            json: false,
            timestamp: timestamp,
            level: options.level,
            console: options.console,
            format: loggerFormat,
        });

        globalTransports[options.name].push(appTransport);
    }

    // 输出到屏幕
    if (options.console) {
        let consoleTransport = new winston.transports.Console({
            localTime: true,
            colorize: true,
            json: false,
            level: options.level,
            timestamp: timestamp,
            format: colorFormat,
        });

        globalTransports[options.name].push(consoleTransport);
    }

    // 错误日志另行输出到错误日志
    if (options.needErrorFile) {
        let errTransport = new DailyRotateFile({
            localTime: true,
            name: `${options.filename}-error`,
            dirname: options.dir,
            filename: `${filename}-error.log`,
            datePattern: datePattern,
            json: false,
            timestamp: timestamp,
            humanReadableUnhandledException: true,
            level: 'error',
            console: options.console,
            format: loggerFormat,
        });

        globalTransports[options.name].push(errTransport);
    }

    // winston实例
    return createLogger({
        transports: globalTransports[options.name],
        exitOnError: false
    });
}


module.exports = Winston;
