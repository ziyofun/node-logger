"use strict";

const { genTraceId, BaseLogger, writer } = require("./baseLogger");
const path = require('path');

let loggerCache;

/**
 * require('./log')(name)
 *
 * @return {Function} log
 */
exports.Logger = function(options) {
    return function(name) {
        if (!name) {
            throw new Error('config.logger.name is required');
        }
        if (name) {
            name = path.basename(name, path.extname(name));
        }
    
        if (!loggerCache) {
            // 利用此options生成logger实例
            options.name = name;
            options.datePattern = 'YYYY-MM-DD-';
            if (options.writeFile && !options.logDir) {
                throw new Error('config.logger.dir is required');
            }
            options.level = process.env.LEVEL || options.level;
    
            loggerCache = BaseLogger(options);
        }
    
        // 公用logger实例，但各自通过闭包封装输出配置
        return loggerCache(name)   
    }
};

exports.genTraceId = genTraceId;


exports.ns = writer;