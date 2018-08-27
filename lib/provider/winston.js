
const moment = require('moment');
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;

winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
const stringify = require('fast-safe-stringify');
const serializeError = require('../util/serialize_error');

const Date_Format = 'YYYY-MM-DD HH:mm:ss.SSS';
const getTimestamp = function () {
    return moment().format(Date_Format);
};

const formatter = function (options) {
    let meta = this.meta
    let timestamp = timestamp();

    // serialize Error meta
    if (meta instanceof Error) {
        meta = serializeError(meta)
    }

    let metaStr = stringify(meta);

    // handle meta
    if (Object.keys(meta).length > 0) {
        return `${timestamp} ${options.level} ${options.message} ${metaStr}`
    }

    return `${timestamp} ${options.level} ${options.message}`
};

const newFormat = printf(options => {

    let timestamp = getTimestamp();

    let meta = this.meta;
    if (meta) {
        let metaStr = stringify(meta);
        return `${timestamp} ${options.level} ${options.message} ${metaStr}`;
    }

    return `${timestamp} ${options.level} ${options.message}`;
});

let gloabalTransports = [];

class Winston {

    constructor(options) {

        // this.gloabalTransports = [];    // 设置成全局, 方便进行dynamic set level

        let appTransport = new winston.transports.DailyRotateFile({
            localTime: true,
            name: `${options.filename}`,
            dirname: options.dir,
            filename: `${options.filename}%DATE%.log`,
            datePattern: '-YYYY-MM-DD',
            json: false,
            timestamp: timestamp,
            level: options.level,
            console: options.console,
            //formatter
            format: newFormat,
        });

        // this.gloabalTransports.push(appTransport);
        gloabalTransports.push(appTransport);

        if (options.console) {
            let consoleTransport = new winston.transports.Console({
                localTime: true,
                colorize: true,
                json: false,
                level: options.level,
                timestamp: timestamp,
                // formatter
                format: newFormat,
            });

            // this.gloabalTransports.push(consoleTransport);
            gloabalTransports.push(consoleTransport);
        }

        if (options.needErrorFile) {
            let errTransport = new winston.transports.DailyRotateFile({
                localTime: true,
                name: `${options.filename}-error`,
                dirname: options.dir,
                filename: `${options.filename}%DATE%-error.log`,
                datePattern: '-YYYY-MM-DD',
                json: false,
                timestamp: timestamp,
                humanReadableUnhandledException: true,
                level: 'error',
                console: options.console,
                // formatter
                format: newFormat,
            });

            // this.gloabalTransports.push(errTransport);
            gloabalTransports.push(errTransport);
        }

        /*
        this.winstonInstance = new (winston.Logger)({
            gloabalTransports: this.gloabalTransports,
            exitOnError: false
        });
        */
        this.winstonInstance = winston.createLogger({
            // gloabalTransports: this.gloabalTransports,
            transports: gloabalTransports,
            exitOnError: false
        });
    };

    /*
    processHandler() {
        process.on('SIGUSR1', function () {
            this.setLevel('debug');
        });
    
        process.on('SIGUSR2', function () {
            this.setLevel('info');
        });
    }
    */

    getInstance() {
        return this.winstonInstance;
    }

    setLevel(level) {
        //for (let transport in this.gloabalTransports) {
        for (let transport in gloabalTransports) {
            for (let key in transport) {
                if (!transport.hasOwnProperty(key)) {
                    continue;
                }
                transport[key].level = level;
            }
        }
    }
}

module.exports = Winston;