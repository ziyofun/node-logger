import { EventEmitter } from 'events';
import * as path from 'path';
import { Logger } from "winston";
import { createLogger, writer } from './logger';
import { Option } from "./type";

let loggerWithoutName: (moduleName: string) => Logger;

/**
 * require('./log')(name)
 *
 * @return {Function} log
 */
export function Logger (options: Option) {
    return function(name: string): Logger {
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

        if (options.autoTraceId) {
            writer.bindEmitter(new EventEmitter());
        }
    
        // 公用logger实例，但各自通过闭包封装输出配置
        return loggerWithoutName(name)  
    }
};

export { genTraceId, getTraceId, setTraceId, writer as ns } from './logger';
