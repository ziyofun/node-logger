"use strict";

const { Path, IP, TraceId } = require('../util');
const provider = require('../provider');
const traceIdInstance = new TraceId();




let defaultLoggerOptions = {
    level: 'debug',
    dir: process.cwd() + '/logs',
    filename: 'app',
    console: false
};

const traceIdHeader = "x-trace-id";
const PlaceHolder = '-';

function winstonInit(loggerName, options = {}) {

    // 使用options和defaultLoggerOptions重新赋值
    let winstonOptions = Object.assign({}, defaultLoggerOptions, options);

    // 重新配置, 调用winston.BaseLogger
    let winstonInstance = provider.winston.newLogger(winstonOptions);

    return winstonInstance;
}

// let winstonInstance = null;

let globalBaseLogger = null;

let DEFAULT_OPTIONS = {
    level: 'debug',
    dir: process.cwd() + '/logs',
    filename: 'app',
    console: false
};



/**
 * 对ctx的包装, 调用
 * @param options
 * @returns {{setContext: setContext, getContext: (function()), info: info, debug: debug, error: error, warn: warn, trace: trace, fatal: fatal, child: child}}
 */
class BaseLogger{

    constructor(loggerName, options = {}) {

        let traceId;
        this.context = {};
        let ctx = this.context;
        // ctx.traceId = options.traceId || traceIdInstance.generate();
        if (options.traceId) {
            traceId = options.traceId;
        }
        else {
            traceId = traceIdInstance.generate();
        }
        ctx.traceId = traceId;
        ctx.api = options.api || PlaceHolder;
        ctx.ext = options.ext || PlaceHolder;
        ctx.pid = process.pid;
        ctx.app = options.app || PlaceHolder;
        ctx.dir = options.dir ? options.dir : defaultLoggerOptions.dir;
        ctx.console = options.console ? options.console : defaultLoggerOptions.console;
        ctx.filename = options.filename ? options.filename : defaultLoggerOptions.filename;
        
        ctx.level = options.level ? options.level:defaultLoggerOptions.level;
        ctx.ip = IP.getLocalIp();
    
        // 创建ctx.dir, 需要root权限
        Path.checkAndmkdirsSync(ctx.dir);
     
        this.winstonInstance = winstonInit(loggerName, ctx);
    }
    
    

    static middleware(loggerName, options = {}) {

        let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {

            ctx.traceId = ctx.req.headers[traceIdHeader] || traceIdInstance.generate();
            ﻿ctx.request.traceId = ctx.traceId;

            ﻿let uri = buildUri(ctx.method, ctx.url);

            let curOptions = Object.assign({
                api: uri,
                traceId: ctx.traceId
            }, defaultLoggerOptions, options);
    
            let baseNodeLoggerInstance = new BaseLogger("", curOptions);
            
            // 赋给ctx
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
        this.winstonInstance.info(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    debug(...args) {
        this.winstonInstance.debug(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    error(...args) {
        this.winstonInstance.error(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    warn(...args) {
        this.winstonInstance.warn(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    trace() {
    }

    fatal() {
    }

    child() {
    }
}

/**
 * 构造uri
 * @param method
 * @param url
 * @returns {*}
 */
let buildUri = function buildUri(method, url) {
    let uri;
    
    if (method.toLowerCase() === "get") {
        let index = url.lastIndexOf('?');
        if (index >= 0) {
            uri = url.slice(0, url.lastIndexOf('?'));
        }
        else {
            uri = url;
        }
    }
    else {
        uri = url;
    }
    
    return uri;
};

let getGlobalBaseLogger = function getGlobalBaseLogger(serviceName, options) {
    if (globalBaseLogger != null) {
        return globalBaseLogger;
    }
    else {
    
        globalBaseLogger = new BaseLogger(serviceName, options);
        return globalBaseLogger;
    }
};

module.exports = {
    BaseLogger,
    getGlobalBaseLogger,
};
