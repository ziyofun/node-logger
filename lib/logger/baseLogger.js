"use strict";


const { format } = require('util');
let { Path, IP, Url, TraceId } = require('../util');
let { Winston, globalWinstonInstance } = require('../service/winston');
let traceIdInstance = new TraceId();

const traceIdHeader = "x-trace-id";
const PlaceHolder = '-';
const PWD = process.cwd();
const DEFAULT_LOGGER_NAME = 'logger';

let defaultOptions = {
    fmt: 'app',
    name: DEFAULT_LOGGER_NAME,
    level: 'debug',
    dir: PWD + '/logs',
    filename: 'app',
    console: false,
    needErrorFile: false,
};


/**
 * 对ctx的包装, 调用
 * @param options
 * @returns {{setContext: setContext, getContext: (function()), info: info, debug: debug, error: error, warn: warn, trace: trace, fatal: fatal, child: child}}
 */
class BaseLogger{
    
    constructor(options = {}) {
        
        this.context = {};
        let ctx = this.context;
        
        let traceId;
        if (options.traceId) {
            traceId = options.traceId;
        }
        else {
            traceId = traceIdInstance.generate();
        }
        
        // config
        // ctx.fmt = options.fmt || defaultOptions.fmt;
        if (options.datePattern !== undefined) {
            ctx.datePattern = options.datePattern;
        }
        else {
            ctx.datePattern = 'YYYYMMDD-';
        }

        if (options.hasOwnProperty('isDatePrefix') && options.isDatePrefix === false) {
            ctx.isDatePrefix = options.isDatePrefix;
        }
        else {
            ctx.isDatePrefix = true;
        }

        if (options.hasOwnProperty('name')) {
            ctx.name = options.name;
        }
        else {
            ctx.name = defaultOptions.name;
        }
        
        ctx.dir = options.dir ? options.dir : defaultOptions.dir;
        ctx.filename = options.filename ? options.filename : defaultOptions.filename;
        ctx.console = options.console ? options.console : defaultOptions.console;
        ctx.level = options.level ? options.level:defaultOptions.level;
        ctx.needErrorFile = options.needErrorFile ? options.needErrorFile : defaultOptions.needErrorFile;
    
        // log items
        // ctx.app = options.app || PlaceHolder;
        ctx.module = options.module || PlaceHolder;     // 使用模块名
        ctx.traceId = traceId;
        // ctx.ip = IP.getLocalIp();
        // ctx.pid = process.pid;
        ctx.api = options.api || PlaceHolder;
        // ctx.ext = options.ext || PlaceHolder;
        ctx.method = options.method || PlaceHolder;
        
        // 创建ctx.dir, 需要root权限
        Path.checkAndmkdirsSync(ctx.dir);
        
        /*
        if (globalWinstonInstance === null) {
            let winston = new Winston(ctx);
            globalWinstonInstance = winston.getInstance();
        }
        */
        if (globalWinstonInstance[ctx.name] === undefined) {
            let winston = new Winston(ctx);
            globalWinstonInstance[ctx.name] = winston.getInstance(ctx.name);
        }
    }

    static middleware(options = {}) {
        
        let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {
            
            let loggerName;
            if (options.name === undefined) {
                loggerName = 'logger';
            }
            else {
                loggerName = options.name;
            }
    
            let traceId = ctx.req.headers[traceIdHeader] || traceIdInstance.generate();
            ctx.traceId = traceId;
            ctx.request.traceId = ctx.traceId;
            
            let uri = Url.getUri(ctx.method, ctx.url);
            
            let curOptions = Object.assign({
                api: uri,
                traceId: ctx.traceId,
                method: ctx.method
            }, defaultOptions, options);
            
            let baseNodeLoggerInstance = new BaseLogger(curOptions);
            
            // set to koa ctx
            ctx[loggerName] = baseNodeLoggerInstance;
            
            await next();
        };
        
        return buildKoa2LoggerHandler;
    }

    setModule(module) {
        this.context.module = module;
        return this;
    }

    getModule(module) {
        return this.context.module;
    }
    
    /*
    setIP (ip) {
        this.context.ip = ip;
        return this;
    }
    
    getIP() {
        return this.context.ip;
    }
    
    setTraceId (traceId) {
        this.context.traceId = traceId;
        return this;
    }
    getTraceid() {
        return this.context.traceId;
    }
    */
    
    info(...args) {
        let content = format(...args);
        // let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.api} ${this.context.method} ${content}`;
        
        // globalWinstonInstance.info(curLog);
        globalWinstonInstance[this.context.name].info(curLog);
    }
    
    
    debug(...args) {
        let content = format(...args);
        // let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.api} ${this.context.method} ${content}`;
        
        globalWinstonInstance[this.context.name].debug(curLog);
    }
    
    error(...args) {
        let content = format(...args);
        // let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.api} ${this.context.method} ${content}`;
        
        globalWinstonInstance[this.context.name].error(curLog);
    }

    warn(...args) {
        let content = format(...args);
        // let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.api} ${this.context.method} ${content}`;

        globalWinstonInstance[this.context.name].warn(curLog);
    }

    trace() {
        let content = format(...args);
        // let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.api} ${this.context.method} ${content}`;

        globalWinstonInstance[this.context.name].trace(curLog);
    }

    fatal() {
        let content = format(...args);
        // let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.api} ${this.context.method} ${content}`;

        globalWinstonInstance[this.context.name].fatal(curLog);
    }
}


module.exports = BaseLogger;
