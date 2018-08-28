"use strict";


const PlaceHolder = "-";
const traceIdHeader = "x-trace-id";
const BaseLogger = require("./baseLogger");

let { Path, IP, TraceId, Url } = require('../util');
const traceIdInstance = new TraceId();

const PWD = process.cwd();
const DEFAULT_LOGGER_NAME = 'logger';

let cityServiceGlobalLoggerMap = {};

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
            
            let uri = Url.buildUri(ctx.method, ctx.url);
            
            let curOptions = Object.assign({
                api: uri,
                traceId: ctx.traceId,
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
}


module.exports = CityServiceLogger;
