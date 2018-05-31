"use strict";

const Logger = require('../business/base-logger');
const TraceId = require('../util/trace_id');
const traceIdHeader = 'sensoro-trace-id';

function buildMiddleware(options) {
    
    let setTraceId = function(ctx, next) {
        ctx.traceId = ctx.req.headers[traceIdHeader] || TraceId.generate();
        var uri;
        if (ctx.method.toLowerCase() == "get") {
            uri = ctx.url.slice(0, ctx.url.lastIndexOf('?'));
        } else {
            uri = ctx.url;
        }
        let newOptions = Object.assign({
            api: uri,
            traceId: ctx.traceId
        }, options);
        ctx.logger = Logger.newLogger(newOptions);
        
        return next();
    }
    
    return setTraceId;
}

module.exports = function middleware(options = {}) {
    let traceMiddleware = buildMiddleware(options)
    return traceMiddleware;
};