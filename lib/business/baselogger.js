"use strict";

const { Path, IP, TraceId } = require('../util');
const provider = require('../provider/index');
// const TraceId = require('../util/trace_id');


let winstonInstance;

let defaultLoggerOptions = {
    level: 'debug',
    dir: process.cwd() + '/logs',
    filename: 'app',
    console: false
};

let defaultLoggerName = "base";

const PlaceHolder = '-';

let baseLoggerMap = {};

// function winstonInit(filename, options = {}) {
function winstonInit(loggerName, options = {}) {

    // 使用options和defaultLoggerOptions重新赋值
    let winstonOptions = Object.assign({}, defaultLoggerOptions, options);

    // 创建winstonOptions.dir, 需要root权限
    // todo: 判断文件是否还存在, 提出去
    Path.mkdirsSync(winstonOptions.dir);

    // 重新配置, 调用winston.BaseLogger
    let winstonInstance = provider.winston.newLogger(winstonOptions);

    baseLoggerMap.filename = true;

    return winstonInstance;
}

/**
 * 对ctx的包装, 调用
 * @param options
 * @returns {{setContext: setContext, getContext: (function()), info: info, debug: debug, error: error, warn: warn, trace: trace, fatal: fatal, child: child}}
 */
class BaseLogger{

    // constructor(options = {}) {
    constructor(loggerName, options = {}) {

        this.context = {};
        let ctx= this.context;
        ctx.traceId = options.traceId || TraceId.generate();
        ctx.api = options.api || PlaceHolder;
        ctx.ext = options.ext || PlaceHolder;
        ctx.pid = process.pid;
        ctx.app = options.app || PlaceHolder;
        ctx.dir = options.dir ? options.dir : defaultLoggerOptions.dir;
        ctx.console = options.console ? options.console : defaultLoggerOptions.console;
        ctx.filename = options.filename ? options.filename : defaultLoggerOptions.filename;
        
        ctx.level = options.level ? options.level:defaultLoggerOptions.level;
        ctx.ip = IP.getLocalIp();
     
        // 检查loggerFileMap中是否已经有了context.filename, 如果
        /*
        if (!baseLoggerMap[ctx.filename]) {
            winstonInstance = winstonInit(ctx.filename, ctx);
        }
        */
        if (!baseLoggerMap[loggerName]) {
            winstonInstance = winstonInit(loggerName, ctx);
        }
    
    }
    
    getBaseLogger(loggerName) {
        return  baseLoggerMap[loggerName];
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
    }
    
    /**
     * 获取newLogger上下文参数
     * @returns {{}}
     */
    getContext() {
        return this.context;
    }

    info(...args) {
        winstonInstance.info(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    debug(...args) {
        winstonInstance.debug(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    error(...args) {
        winstonInstance.error(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    warn(...args) {
        winstonInstance.warn(this.context.app, this.context.traceId, this.context.ip, this.context.pid, this.context.api, this.context.ext, ...args);
    }

    trace() {
    }

    fatal() {
    }

    child() {
    }

}

/*
module.exports = {
    BaseLogger,
    
};
*/

module.exports = BaseLogger;