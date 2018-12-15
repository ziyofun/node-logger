"use strict";
/**
 * @description 打印log基础组件
 */

const { format: Format } = require('util');
const { checkAndmkdirsSync, Winston } = require('../util');
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

let LOGGER;
let CONTEXT;

function BaseLogger (options) {
    const context = {};

    options = Object.assign({}, DEFAULT_OPTIONS, options);

    // 日期格式字符串
    context.datePattern = options.datePattern || 'YYYYMMDD-';

    if (options.hasOwnProperty('isDatePrefix') && options.isDatePrefix === false) {
        context.isDatePrefix = options.isDatePrefix;
    }
    else {
        context.isDatePrefix = true;
    }
    
    context.dir = options.dir;
    context.filename = options.filename;
    context.console = options.console ? options.console : DEFAULT_OPTIONS.console;
    context.level = options.level ? options.level:DEFAULT_OPTIONS.level;
    context.needErrorFile = options.needErrorFile ? options.needErrorFile : DEFAULT_OPTIONS.needErrorFile;
    context.closeFile = options.closeFile ? options.closeFile : DEFAULT_OPTIONS.closeFile;
    context.name = options.name;
    context.traceId = options.traceId;

    // 以下为输出使用项
    context.module = options.module || PLACE_HOLDER;
    context.label = options.label || PLACE_HOLDER;
    context.api = options.api || PLACE_HOLDER;
    context.method = options.method || PLACE_HOLDER;

    // 创建ctx.dir, 需要root权限
    checkAndmkdirsSync(context.dir);

    LOGGER = Winston(context);

    CONTEXT = context;

    context.traceId = getTraceId();
    // 可以自动生成traceId
    if (!context.traceId) {
        if (options.autoTraceId === true) {
            // 从threadLocal中获取或者自动生成 traceId
            context.traceId = genTraceId(options);
        }
        else {
            context.traceId = PLACE_HOLDER;
        }
    }

    return LoggerHOC(LOGGER);
}

// 使用高阶函数
function LoggerHOC (LoggerInstance) {
    return function(outputOpt) {
        if (typeof outputOpt === 'string') {
            outputOpt = {
                name: CONTEXT.name,
                module: outputOpt,
                label: CONTEXT.label,
                api: CONTEXT.api,
                method: CONTEXT.method
            }
        }


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
        }
    }
}

// 私有：使用固定变量包装打印日志
function getContent(...args) {
    return Format(...args);
}

function format(outputOpt, message) {
    return `[${outputOpt.module.toUpperCase()}] ${CONTEXT.traceId} ${outputOpt.label} ${outputOpt.api} ${outputOpt.method} | ${message}`;
}

// 私有：获取当前threadLocal中的traceId
function getTraceId () {
    const namespace = CONTEXT['namespace'] || 'default';
    const ns = CLS.getNamespace(namespace);
    const traceId = ns && ns.get('trace-id');

    console.log('get traceId of %s :: <------', namespace, traceId);

    return traceId;
}

// 重新生成traceId
function genTraceId() {
    const namespace = CONTEXT['namespace'] || 'default';
    const writer = CLS.createNamespace(namespace);
    const traceId = shortid.generate(5);
    writer.run(() => {
        writer.set('trace-id', traceId);
    });

    CONTEXT.traceId = traceId;
    return traceId;
}

module.exports = {
    genTraceId,
    BaseLogger
};
