'use strict';


const { Url, DefaultOption } = require('../util');

const TRACEID_HEADER = "x-trace-id";     // http headers

function middleware(Logger, options = {}) {
    
    let buildKoa2LoggerHandler = async function buildKoa2LoggerHandler(ctx, next) {
        
        let loggerName;
        if (options.name === undefined) {
            loggerName = 'logger';
        }
        else {
            loggerName = options.name;
        }
        
        let uri = Url.getUri(ctx.method, ctx.url);
        
        let httpOptions = {
            api: uri,
            method: ctx.method,
        };
        if (ctx.req.headers[ TRACEID_HEADER ]) {
            httpOptions.traceId = ctx.req.headers[ TRACEID_HEADER ];
        }
 
        let curOptions = Object.assign(httpOptions, DefaultOption, options);
        
        let baseNodeLoggerInstance = new Logger(curOptions);
        
        // set to koa ctx
        ctx[loggerName] = baseNodeLoggerInstance;

        await next();
    };

    return buildKoa2LoggerHandler;
}


module.exports = middleware;
