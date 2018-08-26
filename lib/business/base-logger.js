"use strict";


const { format } = require('util');
let { Path, IP, TraceId } = require('../util');
let { Winston } = require('../provider');
let traceIdInstance = new TraceId();

const traceIdHeader = "x-trace-id";
const PlaceHolder = '-';
const PWD = process.cwd();
const DEFAULT_LOGGER_NAME = 'logger';

let defaultOptions = {
    name: 'logger',
    level: 'debug',
    dir: PWD + '/logs',
    filename: 'app',
    console: false,
    needErrorFile: false,
};


let globalBaseLoggerMap = {};


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

        ctx.traceId = traceId;
        ctx.name = options.name || defaultOptions.name;
        ctx.api = options.api || PlaceHolder;
        ctx.ext = options.ext || PlaceHolder;
        ctx.pid = process.pid;
        ctx.method = options.method || PlaceHolder;
        ctx.app = options.app || PlaceHolder;
        ctx.dir = options.dir ? options.dir : defaultOptions.dir;
        ctx.console = options.console ? options.console : defaultOptions.console;
        ctx.filename = options.filename ? options.filename : defaultOptions.filename;

        ctx.level = options.level ? options.level:defaultOptions.level;
        ctx.ip = IP.getLocalIp();

        // 创建ctx.dir, 需要root权限
        Path.checkAndmkdirsSync(ctx.dir);

        let winston = new Winston(ctx);
        this.winstonInstance = winston.getInstance();
    }
    
    // static globalBaseLoggerMap = {};

    static middleware(options = {}) {
    
        let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {
    
            let loggerName;
            if (options.name === undefined) {
                loggerName = 'logger';
            }
            else {
                loggerName = options.name;
            }
            
            ctx.traceId = ctx.req.headers[traceIdHeader] || traceIdInstance.generate();
            ctx.request.traceId = ctx.traceId;

            let uri = buildUri(ctx.method, ctx.url);

            let curOptions = Object.assign({
                api: uri,
                traceId: ctx.traceId,
                method: ctx.method
            }, defaultOptions, options);
    
            let baseNodeLoggerInstance;
            if (globalBaseLoggerMap[loggerName] === undefined) {
                baseNodeLoggerInstance = new BaseLogger(curOptions);
                globalBaseLoggerMap[loggerName] = baseNodeLoggerInstance;
            }
            else {
                baseNodeLoggerInstance = globalBaseLoggerMap[loggerName];
            }
            
            // set to koa ctx
            ctx[loggerName] = baseNodeLoggerInstance;
            
            await next();
        };

        return buildKoa2LoggerHandler;
    }

    setLevel(level) {
        this.winstonInstance.setLevel(level);
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

        this.winstonInstance.info(curLog);
    }
    

    debug(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
    
        this.winstonInstance.debug(curLog);
    }

    error(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
    
        this.winstonInstance.error(curLog);
    }

    warn(...args) {
        let content = format(...args);
        let curLog = `${this.context.app} ${this.context.traceId} ${this.context.ip} ${this.context.pid} ${this.context.api} ${this.context.ext} ${content}`;
    
        this.winstonInstance.warn(curLog);
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


module.exports = BaseLogger;
