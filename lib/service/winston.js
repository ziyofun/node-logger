
const moment = require('moment');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { timestamp, printf, } = format;

let DailyRotateFile = require('winston-daily-rotate-file');
const stringify = require('fast-safe-stringify');
const serializeError = require('../util/serializeError');

const Date_Format = 'YYYY-MM-DD HH:mm:ss.SSS';
const getTimestamp = function () {
    return moment().format(Date_Format);
};

let globalWinstonInstance = null;

const loggerFormat = printf(options => {
    
    let timestamp = getTimestamp();
    
    let meta = this.meta;
    
    if (meta) {

        if (meta instanceof Error) {
            meta = serializeError(meta)
        }

        let metaStr = stringify(meta);
        return `${timestamp} ${options.level} ${options.message} ${metaStr}`;
    }

    return `${timestamp} ${options.level} ${options.message}`;
});

let gloabalTransports = [];     // 设置成全局, 方便进行dynamic set level

function setLevel(level) {
    for (let transport in gloabalTransports) {
        gloabalTransports[transport].level = level;
        console.log("transport:", transport, "level", level);
    }
}

process.on('SIGUSR1', function () {
    console.log('SIGUSR1, set debug');
    setLevel('debug');
});

process.on('SIGUSR2', function () {
    console.log('SIGUSR2, set info');
    setLevel('info');
});



class Winston {

    constructor(options) {
        let fmt = options.fmt;
        if ( fmt === undefined || fmt != 'city' ) {
            fmt = 'app';
        }

        // let appTransport;
        let filename;
        let datePattern;
        if (fmt === 'app') {
            // filename = `${options.filename}%DATE%.log`;
            filename = `${options.filename}%DATE%`;
            datePattern = '-YYYY-MM-DD';
        }
        else if (fmt === 'city') {
            // filename = `%DATE%${options.filename}-app.log`;
            filename = `%DATE%${options.filename}`;
            datePattern = 'YYYYMMDD-';
        }

        let appTransport = new DailyRotateFile({
            localTime: true,
            name: `${options.filename}`,
            dirname: options.dir,
            filename: `${filename}.log`,
            datePattern: datePattern,
            json: false,
            timestamp: timestamp,
            level: options.level,
            console: options.console,
            format: loggerFormat,
        });

        gloabalTransports.push(appTransport);

        if (options.console) {
            let consoleTransport = new winston.transports.Console({
                localTime: true,
                colorize: true,
                json: false,
                level: options.level,
                timestamp: timestamp,
                format: loggerFormat,
            });

            gloabalTransports.push(consoleTransport);
        }

        if (options.needErrorFile) {
            let errTransport = new DailyRotateFile({
                localTime: true,
                name: `${options.filename}-error`,
                dirname: options.dir,
                // filename: `${options.filename}%DATE%-error.log`,
                // datePattern: '-YYYY-MM-DD',
                filename: `${filename}-error.log`,
                datePattern: datePattern,
                json: false,
                timestamp: timestamp,
                humanReadableUnhandledException: true,
                level: 'error',
                console: options.console,
                format: loggerFormat,
            });

            gloabalTransports.push(errTransport);
        }

        this.winstonInstance = createLogger({
            transports: gloabalTransports,
            exitOnError: false
        });
    };

    getInstance() {
        return this.winstonInstance;
    }
}

module.exports = {
    Winston:Winston,
    globalWinstonInstance: globalWinstonInstance,
};