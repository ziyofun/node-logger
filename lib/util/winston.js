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
const wrapColor = require('./wrapColor');
const { COLORS, LEVELS } = require('../common/colors');

let globalTransports = {};


const loggerFormat = printf(options => {
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
    const colorNameOfLevel = LEVELS[options.level.toUpperCase()].color;
    const colorOfLevel = COLORS[colorNameOfLevel];
    return `[${timestamp}] [${options.level.toUpperCase()}] ${message} ${metaStr}`;
});

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
    const colorNameOfLevel = LEVELS[options.level.toUpperCase()].color;
    const colorOfLevel = COLORS[colorNameOfLevel];
    return `[${wrapColor(timestamp, COLORS.white)}] [${wrapColor(options.level.toUpperCase(), colorOfLevel)}] ${wrapColor(message, colorOfLevel)} ${wrapColor(metaStr, colorOfLevel)}`;
});

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

    return createLogger({
        transports: globalTransports[options.name],
        exitOnError: false
    });
}


module.exports = Winston;
