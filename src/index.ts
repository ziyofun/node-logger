import { Option, AsyncLogger } from "./type";

import { createLogger } from './logger';
const path = require('path');

let loggerWithoutName: (moduleName: string) => AsyncLogger;

/**
 * require('./log')(name)
 *
 * @return {Function} log
 */
export function Logger (options: Option) {
    return function(name: string): AsyncLogger {
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
            
            // createLogger返回一个以模块名为参数的方法，调用此方法即可获得一个logger‘实例’
            loggerWithoutName = createLogger(options);
        }
    
        // 公用logger实例，但各自通过闭包封装输出配置
        return loggerWithoutName(name)  
    }
};

export { genTraceId, getTraceId, setTraceId, writer as ns } from './logger';
