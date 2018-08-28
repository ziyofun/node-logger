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
        ctx.name = options.name || defaultOptions.name;
        ctx.dir = options.dir ? options.dir : defaultOptions.dir;
        ctx.filename = options.filename ? options.filename : defaultOptions.filename;
        ctx.console = options.console ? options.console : defaultOptions.console;
        ctx.level = options.level ? options.level:defaultOptions.level;
        ctx.needErrorFile = options.needErrorFile ? options.needErrorFile : defaultOptions.needErrorFile;
    
        // log items
        ctx.app = options.app || PlaceHolder;
        ctx.traceId = traceId;
        ctx.ip = IP.getLocalIp();
        ctx.pid = process.pid;
        ctx.api = options.api || PlaceHolder;
        ctx.ext = options.ext || PlaceHolder;
        
        // 创建ctx.dir, 需要root权限
        Path.checkAndmkdirsSync(ctx.dir);
        
        if (globalWinstonInstance === null) {
            let winston = new Winston(ctx);
            globalWinstonInstance = winston.getInstance();
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
    
    /**
     * 设置ip
     * @param ip
     * @returns {BaseLogger}
     */
    setIP (ip) {
        this.context.ip = ip;
        return this;
    }
    
    /**
     * 获取当前的ip
     * @returns {*}
     */
    getIP() {
        return this.context.ip;
    }
    
    /**
     * 设置traceId 不推荐使用
     * @param traceId
     * @returns {BaseLogger}
     */
    setTraceId (traceId) {
        this.context.traceId = traceId;
        return this;
    }
    
    /**
     * 获取当前的traceId
     * @returns {*}
     */
    getTraceid() {
        return this.context.traceId;
    }
    
    /**
     * 设置newLogger上下文参数
     * @param options
     */
    setContext (options) {
        Object.assign(this.context, options);
        return this;
    }
    
    /**
     * 获取newLogger上下文参数
     * @returns {{}}
     */
    getContext() {
        return this.context;
    }
    
    info(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        
        // this.winstonInstance.info(curLog);
        globalWinstonInstance.info(curLog);
    }
    
    
    debug(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        
        // this.winstonInstance.debug(curLog);
        globalWinstonInstance.debug(curLog);
    }
    
    error(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        
        // this.winstonInstance.error(curLog);
        globalWinstonInstance.error(curLog);
    }
    
    warn(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
        
        // this.winstonInstance.warn(curLog);
        globalWinstonInstance.warn(curLog);
    }
    
    trace() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
    
        // this.winstonInstance.trace(curLog);
        globalWinstonInstance.trace(curLog);
    }
    
    fatal() {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
    
        // this.winstonInstance.fatal(curLog);
        globalWinstonInstance.fatal(curLog);
    }
}


module.exports = BaseLogger;
