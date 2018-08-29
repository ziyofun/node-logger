"use strict";

const { format } = require('util');
const PlaceHolder = "-";
const traceIdHeader = "x-trace-id";
const BaseLogger = require("./baseLogger");


let { Path, IP, Url, TraceId } = require('../util');
let traceIdInstance = new TraceId();

const PWD = process.cwd();              // 默认日志文件路径
const DEFAULT_LOGGER_NAME = 'logger';   // 默认日志对象name

let { Winston, globalWinstonInstance } = require('../service/winston');

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
        
        let ctx = this.context;
    
        if (globalWinstonInstance === null) {
            let winston = new Winston(ctx);
            globalWinstonInstance = winston.getInstance();
        }
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
            
            let cityServiceNodeLoggerInstance = new CityServiceLogger(curOptions);

            // set to koa ctx
            ctx[loggerName] = cityServiceNodeLoggerInstance;
            
            await next();
        };
        
        return buildKoa2LoggerHandler;
    };

    info(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        
        globalWinstonInstance.info(curLog);
    }

    debug(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance.debug(curLog);
    }

    error(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance.error(curLog);
    }

    warn(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance.warn(curLog);
    }

    trace() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance.trace(curLog);
    }

    fatal() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        globalWinstonInstance.fatal(curLog);
    }
}


module.exports = CityServiceLogger;
