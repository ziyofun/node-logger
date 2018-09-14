"use strict";


const { format } = require('util');
const { Path, TraceId, DefaultOption, PLACE_HOLDER } = require('../util');
const { Winston, globalWinstonInstance } = require('../service/winston');
const traceIdInstance = new TraceId();

// const PLACE_HOLDER = '-';


class BaseLogger {

    constructor(options = DefaultOption) {

        this.context = {};
        let ctx = this.context;

        let traceId;
        if (options.traceId) {
            traceId = options.traceId;
        }
        else {
            if (options.autoTraceId === true) {
                traceId = traceIdInstance.generate();
            }
            else {
                traceId = PLACE_HOLDER;
            }
        }

        // config
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
            ctx.name = DefaultOption.name;
        }

        // winston options
        ctx.dir = options.dir ? options.dir : DefaultOption.dir;
        ctx.filename = options.filename ? options.filename : DefaultOption.filename;
        ctx.console = options.console ? options.console : DefaultOption.console;
        ctx.level = options.level ? options.level:DefaultOption.level;
        ctx.needErrorFile = options.needErrorFile ? options.needErrorFile : DefaultOption.needErrorFile;

        // log items
        ctx.module = options.module || PLACE_HOLDER;     // 使用模块名
        ctx.label = options.label || PLACE_HOLDER;
        ctx.traceId = traceId;
        ctx.api = options.api || PLACE_HOLDER;
        ctx.method = options.method || PLACE_HOLDER;

        // 创建ctx.dir, 需要root权限
        Path.checkAndmkdirsSync(ctx.dir);

        if (globalWinstonInstance[ctx.name] === undefined) {
            let winston = new Winston(ctx);
            globalWinstonInstance[ctx.name] = winston.getInstance(ctx.name);
        }
    }

    /*
    static middleware(options = {}) {
        
        let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {
            
            let loggerName;
            if (options.name === undefined) {
                loggerName = 'logger';
            }
            else {
                loggerName = options.name;
            }
    
            let traceId = ctx.req.headers[ TRACEID_HEADER ] || traceIdInstance.generate();
            ctx.traceId = traceId;
            ctx.request.traceId = ctx.traceId;

            let uri = Url.getUri(ctx.method, ctx.url);

            let curOptions = Object.assign({
                api: uri,
                traceId: ctx.traceId,
                method: ctx.method
            }, DefaultOption, options);

            let baseNodeLoggerInstance = new BaseLogger(curOptions);
            
            // set to koa ctx
            ctx[loggerName] = baseNodeLoggerInstance;
            
            await next();
        };
        
        return buildKoa2LoggerHandler;
    }
    */

    setModule(module) {
        this.context.module = module;
        return this;
    }

    getModule() {
        return this.context.module;
    }

    setLabel(label) {
        this.context.label = label;
        return this;
    }

    getModule() {
        return this.context.label;
    }
    
    getTraceId() {
        return this.context.traceId;
    }
    
    setTraceId(traceId) {
        this.context.traceId = traceId;
    }

    info(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} | ${content}`;

        globalWinstonInstance[this.context.name].info(curLog);
    }

    debug(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} | ${content}`;

        globalWinstonInstance[this.context.name].debug(curLog);
    }

    error(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} | ${content}`;

        globalWinstonInstance[this.context.name].error(curLog);
    }

    warn(...args) {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} | ${content}`;

        globalWinstonInstance[this.context.name].warn(curLog);
    }

    trace() {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} | ${content}`;

        globalWinstonInstance[this.context.name].trace(curLog);
    }

    fatal() {
        let content = format(...args);
        let curLog = `${this.context.module} ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} | ${content}`;

        globalWinstonInstance[this.context.name].fatal(curLog);
    }

}


module.exports = BaseLogger;
