"use strict";

const moment = require('moment');
const winston = require('winston');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
const stringify = require('fast-safe-stringify');
const serializeError = require('../util/serialize_error');

const Date_Format = 'YYYY-MM-DD HH:mm:ss.SSS';
const timestamp = function () {
    return moment().format(Date_Format);
};

const formatter = function (options) {
    let meta = this.meta

    // serialize Error meta
    if (meta instanceof Error) {
        meta = serializeError(meta)
    }

    // handle meta
    if (Object.keys(meta).length > 0) {
        return timestamp() + ' ' + options.level + ' ' + options.message + ' ' + stringify(meta)
    }
    
    return timestamp() + ' ' + options.level + ' ' + options.message
};


function newLogger(options = {}) {
    let transports = [];
    const appTransport = new winston.transports.DailyRotateFile({
        localTime: true,
        name: `${options.filename}`,
        dirname: options.dir,
        filename: `${options.filename}%DATE%.log`,
        datePattern: '-YYYY-MM-DD',
        json: false,
        timestamp: timestamp,
        level: options.level,
        formatter
    });

    const errTransport = new winston.transports.DailyRotateFile({
        localTime: true,
        name: `${options.filename}-error`,
        dirname: options.dir,
        filename: `${options.filename}%DATE%-error.log`,
        datePattern: '-YYYY-MM-DD',
        json: false,
        timestamp: timestamp,
        humanReadableUnhandledException: true,
        level: 'error',
        formatter
    });

    transports.push(appTransport);
    transports.push(errTransport);
    
    if (options.console) {
        transports.push(new winston.transports.Console({
            localTime: true,
            colorize: true,
            json: false,
            level: options.level,
            timestamp: timestamp,
            formatter
        }));
    }

    return new (winston.Logger)({
        transports,
        exitOnError: false
    });
}

module.exports = {
    newLogger
};