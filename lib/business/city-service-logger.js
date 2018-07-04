"use strict";

const PlaceHolder = "-";
const traceIdHeader = "x-trace-id";
const BaseLogger = require("./base-logger");
const { TraceId } = require("../util");
const traceIdInstance = new TraceId();

let CONSTANTS = {

};

let cityServiceLoggerMap = {};

let defaultServiceLoggerOptions = {
    level: 'debug',
    dir: process.cwd() + '/logs',
    filename: 'app',
    console: false
}

class CityServiceLogger {

    /**
     * 初始化
     * @param option
     *          logger 日志对象
     */
    constructor(loggerName, options) {
        this.businessType = PlaceHolder;
        if(options.logger) {
            this.logger = options.logger;
            this.logger.setTraceId(options.traceId);    // todo 感觉写的不好
        }
        
        else {
            let cityServiceOptions = Object.assign({}, defaultServiceLoggerOptions, options);
            
            let curOptions = cityServiceOptions;
    
            let baseNodeLoggerInstance;
            // 检查cityServiceLoggerMap内是否已经有了对应loggerName
            if( !cityServiceLoggerMap[loggerName] ) {
                baseNodeLoggerInstance = new BaseLogger(loggerName, curOptions);
                cityServiceLoggerMap[loggerName] = baseNodeLoggerInstance;
            }
            
            this.logger = baseNodeLoggerInstance;
        }
    }
    
    /**
     * koa2 日志中间件
     * @param options 日志配置信息
     * @returns {buildKoa2LoggerHandler}
     */
    static middleware(loggerName, options = {}) {

        let cityServiceOptions = Object.assign({}, defaultServiceLoggerOptions, options);

        let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {

            let traceId;
            
            if (ctx.request.headers[traceIdHeader]) {
                traceId = ctx.request.headers[traceIdHeader];
            } else {
                traceId = traceIdInstance.generate();
            }

            ctx.traceId = traceId;

            let uri = buildUri(ctx.method, ctx.url);

            let curOptions = Object.assign({
                api: uri,
                traceId: ctx.traceId
            }, cityServiceOptions);
  
            // let baseNodeLoggerInstance = new BaseLogger("", curOptions);
            let baseNodeLoggerInstance = new BaseLogger.getGlobalBaseLogger(loggerName, curOptions);

            ctx[loggerName] = new CityServiceLogger(loggerName, {
                logger: baseNodeLoggerInstance,
                traceId: ctx.traceId,
            });

            await next();

            return;
        };
        
        return buildKoa2LoggerHandler;
    };
    
    static getCityServiceLogger(loggerName) {
        return cityServiceLoggerMap[loggerName];
    }
    
    /**
     * 设置app参数, city service为city-service
     */
    setApp2Context(app) {
        if (this.logger.setContext && app) {
            this.logger.setContext({app: app});
        }
    }
    
    /**
     * 设置traceId参数
     * @param traceId
     */
    setTraceId2Context(traceId) {
        if (this.logger.setContext && traceId) {
            this.logger.setContext({traceId: traceId});
        }
    }
    
    /**
     * 设置api参数
     * @param api
     */
    setApi2Context(api) {
        if (this.logger.setContext && api) {
            this.logger.setContext({api: api});
        }
    }
    
    /**
     * 设置日志记录对象
     * @param logger
     */
    setLogger(logger) {
        this.logger = logger;
        return this;
    }
    
    /**
     * 设置业务类型
     * @param actionType
     */
    setBusiness(businessType) {
        this.businessType = businessType || PlaceHolder;
        
        return this;
    }
    
    /**
     * 每次记录日志之后将次级属性置为"-"
     */
    refreshSecondaryProperty() {
        this.businessType = PlaceHolder;
    }
    
    /**
     * debug
     * @param args
     */
    debug(...args) {
        if (this.logger) {
            this.logger.debug(this.businessType, ...args);
            this.refreshSecondaryProperty();
        } else {
            console.error('logger of LockCommonLogger is null');
        }
    }
    
    /**
     * info
     * @param args
     */
    info(...args) {
        if (this.logger) {
            this.logger.info(this.businessType, ...args);
            this.refreshSecondaryProperty();
        } else {
            console.error('logger of LockCommonLogger is null');
        }
    }
    
    /**
     * warn
     * @param args
     */
    warn(...args) {
        if (this.logger) {
            this.logger.warn(this.businessType, ...args);
            this.refreshSecondaryProperty();
        } else {
            console.error('logger of LockCommonLogger is null');
        }
    }
    
    /**
     * error
     * @param args
     */
    error(...args) {
        if (this.logger) {
            this.logger.error(this.businessType, ...args);
            this.refreshSecondaryProperty();
        } else {
            console.error('logger of LockCommonLogger is null');
        }
    }
    
    /**
     * 格式化某些类型的日志
     * @param type
     * @param text
     * @returns {}
     */
    format(type, text) {
        switch (type) {
            case CONSTANTS.BUSINESS_LOG_TYPE:
                return {type: type, log: text};
            case CONSTANTS.BUSINESS_DATA_TYPE:
                return {type: type, data: text};
            default:
                return null;
        }
    }
    
    /**
     * 格式化日志类型的日志
     * @param text
     */
    formatLog(text) {
        return this.format(CONSTANTS.BUSINESS_LOG_TYPE, text);
    }
    
    /**
     * 格式化数据类型的日志
     * @param text
     */
    formatData(text) {
        return this.format(CONSTANTS.BUSINESS_DATA_TYPE, text);
    }
};


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



module.exports = CityServiceLogger;