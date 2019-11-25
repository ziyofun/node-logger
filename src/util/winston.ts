import { createLogger, format, transports as Transports, Logger } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import stringify from 'fast-safe-stringify';
import * as moment from 'moment';
import * as os from 'os';
import { Option } from '../type';


// 格式化输出，用于输出到文件
const loggerFormat = format.printf(options => {
    const timestamp = moment().toISOString(true);

    // 处理多行message
    const message = options.message ? options.message.replace(/\r\n|\r|\n/g, `${os.EOL} | `) : options.message;

    return `+ ${timestamp} ${options.level.toUpperCase()} ${message}`;
});

const instanceMapping = new Map<string, any>();
// 工具函数，传入配置，返回一个winston实例
export function createWinston(options: Option): Logger {
    // 相同配置返回同一实例
    const optionString = stringify(options);
    if (instanceMapping.has(optionString)) {
        return instanceMapping.get(optionString);
    }

    const datePattern = options.datePattern || 'YYYYMMDD-';
    const filename = `${options.filename}%DATE%`;

    /** 通过不同的配置决定输出流 */
    const transports = [];

    // 写文件
    if (options.writeFile) {
        transports.push(
            new DailyRotateFile({
                dirname: options.dir,
                filename: `${filename}.log`,
                datePattern: datePattern,
                json: false,
                level: options.level,
                maxSize: '100m',
                format: loggerFormat,
            })
        )
    }

    // 输出到屏幕
    if (options.console) {
        transports.push(
            new Transports.Console({
                level: options.level,
                format: loggerFormat
            })
        )
    }

    // 错误日志另行输出到错误日志
    if (options.needErrorFile) {
        transports.push(
            new DailyRotateFile({
                dirname: options.dir,
                filename: `${filename}-error.log`,
                datePattern: datePattern,
                json: false,
                level: 'error',
                format: loggerFormat,
            })
        )
    }

    // winston实例
    const instance = createLogger({
        transports,
        exitOnError: false
    });

    instanceMapping.set(optionString, instance);

    return instance;
}
