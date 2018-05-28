"use strict";

const pathUtil = require('../util/path');
const path = require('path');
const provider = require('../provider/index');
const TraceId = require('../util/trace_id');


let winstonInstance;

let loggerOptions = {
    level: 'debug',
    dir: process.cwd() + '/logs',
    filename: 'app',
    console: false
};

const PlaceHolder = '-';

let loggerMap = {};

function winstonInit(filename, options = {}) {
    
    // 使用options重新赋值loggerOptions
    let winstonOptions = Object.assign({}, loggerOptions, options);
    
    debugger
    // 创建loggerOptions.dir, 需要root权限
    pathUtil.mkdirsSync(winstonOptions.dir);
    
    // 重新配置, 调用winston.newLogger
    //loggerOptions.logger = provider.winston.newLogger(winstonOptions);
    let winstonInstance = provider.winston.newLogger(winstonOptions);
    
    loggerMap.filename = true;
    
    return winstonInstance;
}

/**
 * 对ctx的包装, 调用
 * @param options
 * @returns {{setContext: setContext, getContext: (function()), info: info, debug: debug, error: error, warn: warn, trace: trace, fatal: fatal, child: child}}
 */
function newLogger(options = {}) {
    
    let context = {};
    context.traceId = options.traceId || TraceId.generate();
    context.api = options.api || PlaceHolder;
    context.ext = options.ext || PlaceHolder;
    context.pid = process.pid;
    context.app = options.app || PlaceHolder;
    context.dir = options.dir;
    context.console = options.console;
    context.filename = options.filename;
    context.level = options.level;
    
    if(!loggerMap[context.filename]) {
        
        debugger
        
        winstonInstance = winstonInit(context.filename, context);
    }
    
    debugger
    
    
    // 新的init在这里执行
    //winstonInit(context);

    return {
        /**
         * 设置newLogger上下文参数
         * @param options
         */
        setContext: function (options) {
            Object.assign(context, options);
        },

        /**
         * 获取newLogger上下文参数
         * @returns {{}}
         */
        getContext: function () {
            return context;
        },

        info: function (...args) {
            // loggerOptions.logger.info(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
            winstonInstance.info(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
        },

        debug: function (...args) {
            // loggerOptions.logger.debug(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
            winstonInstance.debug(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
        },

        error: function (...args) {
            // loggerOptions.logger.error(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
            winstonInstance.error(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
        },

        warn: function (...args) {
            // loggerOptions.logger.warn(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
            winstonInstance.warn(context.app, context.traceId, context.pid, context.api, context.ext, ...args);
        },

        trace: function () {
        },

        fatal: function () {
        },

        child: function () {
        }

    }
}


module.exports = {
    winstonInit,
    newLogger,
    loggerOptions
};