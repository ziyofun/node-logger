import * as moment from 'moment';
import * as os from 'os';
import { createLogger, format, Logger, transports as Transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { getTraceId } from '..';
import { Option } from '../type';

const { combine, timestamp } = format;

// 格式化输出，用于输出到文件
const loggerFormat = format.printf(options => {
    const timestamp = moment().toISOString(true);

    // 处理多行message
    const message = options.message ? options.message.replace(/\r\n|\r|\n/g, `${os.EOL} | `) : options.message;

    console.log('options :: %s', options);

    return `+ ${timestamp} ${options.level.toUpperCase()} <${options.module || '--'}> {${options['trace-id']}} | ${message}`;
});

// 工具函数，传入配置，返回一个winston实例
export function createWinston(options: Option): Logger {
    const datePattern = options.datePattern || 'YYYYMMDD-';
    const filename = `${options.filename}%DATE%`;

    // 定义不同的format
    let formatter = combine(
        format(info => {
            info['trace-id'] = getTraceId();
            return info;
        })(),
        timestamp(),
    );

    if (options.json) {
        formatter = combine(formatter, format.json())
    } else {
        formatter = combine(formatter, loggerFormat)
    }

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
                format: formatter,
            })
        )
    }

    // 输出到屏幕
    if (options.console) {
        transports.push(
            new Transports.Console({
                level: options.level,
                format: formatter
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
                format: formatter,
            })
        )
    }

    // winston实例
    const instance = createLogger({
        transports,
        exitOnError: false
    });

    return instance;
}
