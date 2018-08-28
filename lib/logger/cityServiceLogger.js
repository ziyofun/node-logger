"use strict";

const { format } = require('util');
const PlaceHolder = "-";
const traceIdHeader = "x-trace-id";
const BaseLogger = require("./baseLogger");

let { Path, IP, Url } = require('../util');
const traceIdInstance = require('../util/traceId');

const PWD = process.cwd();              // 默认日志文件路径
const DEFAULT_LOGGER_NAME = 'logger';   // 默认日志对象name

let cityServiceGlobalLoggerMap = {};    // cityServiceLogger对象的map, 用于保存多个日志实例

let defaultOptions = {
    name: DEFAULT_LOGGER_NAME,
    level: 'debug',
    dir: PWD + '/logs',
    filename: 'app',
    console: false,
    needErrorFile: false,
};

class CityServiceLogger extends BaseLogger {
    
    constructor(options) {
        super(options);
        
        this.context.method = options.method ? options.method : PlaceHolder;
    }
    
    /**
     * koa2 日志中间件
     * @param options 日志配置信息
     * @returns {buildKoa2LoggerHandler}
     */
    static middleware(options) {
        
        let loggerName;
        if (options.name === undefined) {
            loggerName = 'logger';
        }
        else {
            loggerName = options.name;
        }
        
        let cityServiceOptions = Object.assign({}, defaultOptions, options);
        
        let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {
            
            let traceId;
            
            if (ctx.request.headers[traceIdHeader]) {
                traceId = ctx.request.headers[traceIdHeader];
            } else {
                traceId = traceIdInstance.generate();
            }
            
            ctx.traceId = traceId;
    
            let method = ctx.req.method;
            let uri = Url.getUri(method, ctx.url);
            
            let curOptions = Object.assign({
                api: uri,
                traceId: ctx.traceId,
                method: method,
            }, cityServiceOptions);
            
            let cityServiceNodeLoggerInstance;
            if (cityServiceGlobalLoggerMap[loggerName] === undefined) {
                cityServiceNodeLoggerInstance = new CityServiceLogger(curOptions);
                cityServiceGlobalLoggerMap[loggerName] = cityServiceNodeLoggerInstance;
            }
            else {
                cityServiceNodeLoggerInstance = cityServiceGlobalLoggerMap[loggerName];
            }
            
            // set to koa ctx
            ctx[loggerName] = cityServiceNodeLoggerInstance;
            
            await next();
        };
        
        return buildKoa2LoggerHandler;
    };

    info(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.method} ${this.context.ext} ${content}`;
        this.winstonInstance.info(curLog);
    }

    debug(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.method} ${this.context.ext} ${content}`;
        this.winstonInstance.debug(curLog);
    }

    error(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.method} ${this.context.ext} ${content}`;
        this.winstonInstance.error(curLog);
    }

    warn(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.method} ${this.context.ext} ${content}`;
        this.winstonInstance.warn(curLog);
    }

    trace() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.method} ${this.context.ext} ${content}`;
        this.winstonInstance.trace(curLog);
    }

    fatal() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.method} ${this.context.ext} ${content}`;
        this.winstonInstance.fatal(curLog);
    }
}


module.exports = CityServiceLogger;
