"use strict";

const { BaseLogger } = require("./lib/logger");
const Middleware = require("./lib/middleware/middleware");
const { globalWinstonInstance } = require('./lib/service/winston');

module.exports = {
    BaseLogger,
    globalWinstonInstance,
};


const { format } = require('util');
const PlaceHolder = "-";
const traceIdHeader = "x-trace-id";
// const BaseLogger = require("./baseLogger");


// let { Url, TraceId } = require('../util');
// let { TraceId } = require('../util');
// let traceIdInstance = new TraceId();

const PWD = process.cwd();              // 默认日志文件路径
const DEFAULT_LOGGER_NAME = 'logger';   // 默认日志对象name

// let { Winston, globalWinstonInstance } = require('../service/winston');

/*
let defaultOptions = {
    name: DEFAULT_LOGGER_NAME,
    level: 'debug',
    dir: PWD + '/logs',
    filename: 'my',
    console: false,
    needErrorFile: false,
};
*/

let defaultOptions = {
    // fmt: 'app',
    name: DEFAULT_LOGGER_NAME,
    level: 'debug',
    dir: PWD + '/logs',
    filename: 'my',
    console: true,
    needErrorFile: false,
    // autoTraceId: true,
    autoTraceId: false,
};

class ExtendLogger extends BaseLogger {
    
    constructor(options = defaultOptions) {
        super(options);
        
        // this.context.method = options.method ? options.method : PlaceHolder;
        
        let ctx = this.context;
        
        // 为兼容city-service和监控服务的日志
        /*
        ctx.app = options.app || PlaceHolder;
        ctx.pid = process.pid;
        ctx.ext = options.ext || PlaceHolder;
        */
        ctx.myItem = options.myItem || PlaceHolder;
        
        /*
        if (globalWinstonInstance[ctx.name] === undefined) {
            let winston = new Winston(ctx);
            globalWinstonInstance[ctx.name] = winston.getInstance(ctx.name);
        }
        */
    }
    
    /**
     * koa2 日志中间件
     * @param options 日志配置信息
     * @returns {buildKoa2LoggerHandler}
     */
    static middleware(options) {
        
        /*
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
            // let uri = Url.getUri(method, ctx.url);
            
            let curOptions = Object.assign({
                // api: uri,
                // traceId: ctx.traceId,
                method: method,
            }, cityServiceOptions);
            
            let cityServiceNodeLoggerInstance = new PreviousLogger(curOptions);
            
            // set to koa ctx
            ctx[loggerName] = cityServiceNodeLoggerInstance;
            
            await next();
        };
        
        return buildKoa2LoggerHandler;
        */
        
        return BaseLogger.middleware(options);
    };
    
    setMyItem(item) {
        this.context.myItem = item;
        return this;
    }
    
    getMyItem() {
        return this.context.myItem;
    }
    
    info(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} ${this.context.myItem} | ${content}`;
        globalWinstonInstance[this.context.name].info(curLog);
    }
    
    debug(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} ${this.context.myItem} | ${content}`;
        globalWinstonInstance[this.context.name].debug(curLog);
    }
    
    error(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} ${this.context.myItem} | ${content}`;
        globalWinstonInstance[this.context.name].error(curLog);
    }
    
    warn(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} ${this.context.myItem} | ${content}`;
        globalWinstonInstance[this.context.name].warn(curLog);
    }
    
    trace() {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} ${this.context.myItem} | ${content}`;
        globalWinstonInstance[this.context.name].trace(curLog);
    }
    
    fatal() {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} ${this.context.myItem} | ${content}`;
        globalWinstonInstance[this.context.name].fatal(curLog);
    }
}


/*
let extendLogger = new ExtendLogger();
extendLogger.setModule('module');
extendLogger.setLabel('label');
extendLogger.setMyItem('myItem');
extendLogger.info('aaa');
*/

let Koa = require('koa');
let app = new Koa();
const port = 3009;

let loggerOptions = {
    datePattern: 'YYYYMMDD-',   // 日志文件名时间格式
    isDatePrefix: true,         // 日志文件名时间是否是前缀
    name: 'logger',             // logger实例的名字
    filename:"test",            // 日志文件名filename部分
    dir:'./log',                // 日志文件目录
    level: 'info',              // 最低日志等级
    console:true,               // 是否在console打印
    needErrorFile: true,        // 是否同时生成-error.log日志
}

let loggerOptions2 = {
    datePattern: '-YYYY-MM-DD',
    isDatePrefix: false,
    name: 'logger2',
    filename:"app",
    dir:'./log',
    level: 'info',
    console:true,
}


// app.use(ExtendLogger.middleware(loggerOptions));
// app.use(ExtendLogger.middleware(loggerOptions2));
app.use(Middleware(BaseLogger, loggerOptions));
app.use(Middleware(BaseLogger, loggerOptions2));
// app.use(Middleware(ExtendLogger, loggerOptions));
// app.use(Middleware(ExtendLogger, loggerOptions2));

app.use(async function handler(ctx, next) {
    if (ctx.url == '/') {
        
        ctx.logger.setModule('root');
        ctx.logger.info('base logger test 1');
        ctx.logger.info('i am a template added by %s', 'nathan', 'but not lzy, haha!')
        ctx.logger.debug('lzy');
        ctx.logger.error('error!!');
        ctx.logger.debug('debug');
        
        ctx.logger2.info('base logger test 2');
        
        ctx.body = 'city logger!';
        
        await next();
    }
    
    if (ctx.url == '/debug') {
        
        ctx.logger.debug('lzy');
        
        ctx.body = 'City Service!';
    }
    
});

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});