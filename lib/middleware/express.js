"use strict";

const Logger = require('../business/baselogger');
const TraceId = require('../util/trace_id');
const traceIdHeader = 'sensoro-trace-id';   //x-trace-id

module.exports = function middleware(options = {}) {
    options.parseToken = options.parseToken || function (req) {
            let body = req.body;
            return body ? body.token : '';
        };
    return function (req, res, next) {
        // Logger
        const token = options.parseToken(req);
        req.traceId = req.headers[traceIdHeader] || TraceId.generate();
        let o = Object.assign({
            api: req.path,
            traceId: req.traceId,
            ext: token
        }, options);
        req.logger = Logger.newLogger(o);

        next();
    }

};