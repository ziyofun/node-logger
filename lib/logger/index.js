"use strict";

const { genTraceId, getTraceId, setTraceId, createLogger, writer } = require("./baseLogger");
const path = require('path');

let loggerWithoutName;

/**
 * require('./log')(name)
 *
 * @return {Function} log
 */
exports.Logger = function(options) {
    return function(name) {
        if (!name) {
            throw new Error('logger name is required');
        }
        if (name) {
            name = path.basename(name, path.extname(name));
        }
    
        if (!loggerWithoutName) {
            // 利用此options生成logger实例
            options.name = name;
            options.datePattern = options.datePattern || 'YYYY-MM-DD-';
            if (options.writeFile && !options.dir) {
                throw new Error('config.logger.dir is required');
            }
            options.level = process.env.LEVEL || options.level;
            
            // createLogger返回一个以模块名为参数的方法，调用此方法即可获得一个logger‘实例’
            loggerWithoutName = createLogger(options);
        }
    
        // 公用logger实例，但各自通过闭包封装输出配置
        return loggerWithoutName(name)   
    }
};

exports.genTraceId = genTraceId;
exports.getTraceId = getTraceId;
exports.setTraceId = setTraceId;

exports.ns = writer;