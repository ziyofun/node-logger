/**
 * Created by wusilei-rj on 17/11/9.
 */

const Logger = require('../business/baselogger');
const TraceId = require('../util/trace_id');
const traceIdHeader = 'sensoro-trace-id';

module.exports = function middleware(options = {}) {
    return function* (next) {
        // Logger
        this.traceId = this.req.headers[traceIdHeader] || TraceId.generate();
        var uri;
        if (this.method.toLowerCase() == "get") {
            uri = this.url.slice(0, this.url.lastIndexOf('?'));
        } else {
            uri = this.url;
        }
        let o = Object.assign({
            api: uri,
            traceId: this.traceId
        }, options);
        this.logger = Logger.newLogger(o);

        yield next;
    }
};