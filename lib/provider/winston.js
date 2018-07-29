
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

/*
function winstonInit(loggerName, options = {}) {
    
    // 使用options和defaultLoggerOptions重新赋值
    let winstonOptions = Object.assign({}, defaultLoggerOptions, options);
    
    // 重新配置, 调用winston.BaseLogger
    let winstonInstance = provider.winston.newLogger(winstonOptions);
    
    return winstonInstance;
}
*/

class Winston {
    
    constructor(options) {
        
        //this.init();
        
        // let transports = [];
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
    
        //this.winstonInstance = new (winston.Logger)({
        this.winstonInstance = winston.createLogger({
            transports: this.transports,
            exitOnError: false
        });
    };

    init() {
        this.dynamicTransports = [];
        
        /*
        let transports = winston.transports;
    
        for (let x in transports) {
            if (!transports.hasOwnProperty(x)) {
                continue;
            }
            let _old = transports[x];
            transports[x] = function (...args) {
                let tran = new _old(...args);
                this.dynamicTransports.push(tran);
                return tran;
            }
        }
        */
    
        for (let x in transports) {
            if (!transports.hasOwnProperty(x)) {
                continue;
            }
            let _old = transports[x];
            transports[x] = function (...args) {
                let tran = new _old(...args);
                this.dynamicTransports.push(tran);
                return tran;
            }
        }
    }
    
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
        /*
        for (let x in this.dynamicTransports) {
            if (!this.dynamicTransports.hasOwnProperty(x)) {
                continue;
            }
            this.tranport = this.dynamicTransports[x];
            this.tranport.level = level;
        }
        */
    }
}

/*
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
*/

/*
module.exports = {
    newLogger
};
*/

module.exports = Winston;