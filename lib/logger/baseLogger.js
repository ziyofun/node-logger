"use strict";
/**
 * @description 打印log基础组件
 */

const {
    format: Format
} = require('util');
const {
    checkAndmkdirsSync,
    Winston
} = require('../util');
const shortid = require('shortid');
const CLS = require('cls-hooked');

const PLACE_HOLDER = '-';
const PWD = process.cwd();
const DEFAULT_LOGGER_NAME = 'logger';


const DEFAULT_OPTIONS = {
    name: DEFAULT_LOGGER_NAME,
    level: 'debug',
    dir: PWD + '/logs',
    filename: 'app',
    console: false,
    needErrorFile: false,
    autoTraceId: true,
    closeFile: false
};

let CONTEXT;

// 基础日志组建
function BaseLogger(options) {
    const context = {};

    options = Object.assign({}, DEFAULT_OPTIONS, options);

    // 日期格式字符串
    context.datePattern = options.datePattern || 'YYYYMMDD-';

    if (options.hasOwnProperty('isDatePrefix') && options.isDatePrefix === false) {
        context.isDatePrefix = options.isDatePrefix;
    } else {
        context.isDatePrefix = true;
    }

    context.dir = options.dir;
    context.filename = options.filename;
    context.console = options.console ? options.console : DEFAULT_OPTIONS.console;
    context.level = options.level ? options.level : DEFAULT_OPTIONS.level;
    context.needErrorFile = options.needErrorFile ? options.needErrorFile : DEFAULT_OPTIONS.needErrorFile;
    context.closeFile = options.closeFile ? options.closeFile : DEFAULT_OPTIONS.closeFile;
    context.name = options.name;
    context.traceId = options.traceId;

    // 以下为输出使用项
    context.module = options.module || PLACE_HOLDER;
    context.label = options.label || PLACE_HOLDER;
    context.api = options.api || PLACE_HOLDER;
    context.method = options.method || PLACE_HOLDER;

    return LoggerHOC(context);
}

// 私有：使用高阶函数
function LoggerHOC(context) {

    return function (outputOpt) {

        if (typeof outputOpt === 'string') {
            outputOpt = {
                name: '-',
                module: outputOpt,
                label: '-',
                api: '-',
                method: '-'
            }
        }

        // 创建ctx.dir, 需要root权限
        checkAndmkdirsSync(context.dir);
        context.filename = outputOpt.module;
        const LoggerInstance = Winston(context);

        return {
            /**
             * @description 所有打印方法
             * @param  {...any} args 日志打印参数
             */
            info(...args) {
                const curLog = format(outputOpt, getContent(...args));
                LoggerInstance.info(curLog);
            },

            debug(...args) {
                const curLog = format(outputOpt, getContent(...args));

                LoggerInstance.debug(curLog);
            },

            error(...args) {
                const curLog = format(outputOpt, getContent(...args));

                LoggerInstance.error(curLog);
            },

            warn(...args) {
                const curLog = format(outputOpt, getContent(...args));

                LoggerInstance.warn(curLog);
            },

            trace(...args) {
                const curLog = format(outputOpt, getContent(...args));

                LoggerInstance.trace(curLog);
            },

            fatal(...args) {
                const curLog = format(outputOpt, getContent(...args));
                LoggerInstance.fatal(curLog);
            }
        };
    }
}

const namespace = 'default';
const writer = CLS.createNamespace(namespace);

let getContent,format,getTraceId,genTraceId
// writer.run(() => {
    // 私有：使用固定变量包装打印日志
    getContent = function getContent(...args) {
        return Format(...args);
    };

    format = function format(outputOpt, message) {
        let traceId = getTraceId();
        // 可以自动生成traceId
        if (!traceId) {
            // 从threadLocal中获取或者自动生成 traceId
            traceId = genTraceId();
        }
        return `[${outputOpt.module.toUpperCase()}] ${traceId} ${outputOpt.label} ${outputOpt.api} ${outputOpt.method} | ${message}`;
    }

    // 私有：获取当前threadLocal中的traceId
    getTraceId = function getTraceId() {
        let traceId;
        traceId = writer && writer.get('trace-id');
        // console.log('traceId of namespace %j is :: ', writer, traceId);

        return traceId;
    };

    // 重新生成traceId
    genTraceId = function genTraceId() {
        const traceId = shortid.generate(5);
        writer.set('trace-id', traceId);
        return traceId;
    };
// })

module.exports = {
    BaseLogger,
    genTraceId,
    writer
};
