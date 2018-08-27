
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
            format: newFormat,
        });
        
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
        
        this.winstonInstance = winston.createLogger({
            transports: gloabalTransports,
            exitOnError: false
        });
    };
    
    getInstance() {
        return this.winstonInstance;
    }
    
    setLevel(level) {
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