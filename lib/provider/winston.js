
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


class Winston {
    
    constructor(options) {
        
        this.transports = [];
        
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
            formatter
        });
        
        this.transports.push(appTransport);
    
        if (options.console) {
            let consoleTransport = new winston.transports.Console({
                localTime: true,
                colorize: true,
                json: false,
                level: options.level,
                timestamp: timestamp,
                formatter
            });
    
            this.transports.push(consoleTransport);
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
                formatter
            });
            
            this.transports.push(errTransport);
        }
    
        this.winstonInstance = new (winston.Logger)({
            transports: this.transports,
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
        // module.exports.level = level;
        for (let transport in this.transports) {
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