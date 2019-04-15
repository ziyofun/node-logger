"use strict";
/**
 * @description 打印log基础组件
 */

const {
    format: FormatUtil
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

// 默认配置
const DEFAULT_OPTIONS = {
    name: DEFAULT_LOGGER_NAME,
    level: 'info',
    dir: PWD + '/logs',
    filename: 'app',
    console: false,
    needErrorFile: false,
    autoTraceId: true,
    closeFile: false,
    datePattern: 'YYYYMMDD-'
};

// 支持的打印方法
const methodSupported = ['info', 'debug', 'warn', 'error', 'trace', 'fatal'];

// 基础日志组建
function createLogger(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    // 通过闭包返回各自模块的打印工具实例
    return LoggerHOC(options);
}

// 私有：使用高阶函数
function LoggerHOC(context) {

    return function (moduleName) {

        if (typeof moduleName !== 'string') {
            moduleName = '-';
        }

        // 若无日志文件夹则创建, 需要root权限
        checkAndmkdirsSync(context.dir);
        context.filename = moduleName;
        // 使用单例模式，避免内存开销
        const LoggerInstance = Winston(context);
        // 各引用使用的日志对象
        const loggerObj = {};

        for (const method of methodSupported) {
            /**
             * @description 所有打印方法
             * @param  {...any} args 日志打印参数
             */
            loggerObj[method] = (...args) => {
                if (!LoggerInstance[method]) {
                    console.error('method %s not supported', method);
                }

                const curLog = format(moduleName, getContent(...args));
                LoggerInstance[method](curLog)
            }
        }
        return loggerObj;
    }

    // 格式化打印信息
    function getContent(...args) {
        return FormatUtil(...args);
    };

    // 添加自定义信息并以固定格式输出信息
    function format(moduleName, message) {
        let traceId = '-';
        try {
            traceId = getTraceId();
            // 可以自动生成traceId
            if (!traceId && context.autoTraceId) {
                // 从threadLocal中获取或者自动生成 traceId
                traceId = genTraceId();
            }
        } catch (error) {
            // 在未创建context时可以实现忽略traceId的打印
            traceId = '-';
        }

        return `<${moduleName || PLACE_HOLDER}> {${traceId}} | ${message}`;
    }
}

// 以下方法使用async-wrap为日志添加异步调用间的唯一traceId功能
// 暂未支持多namespace功能
const namespace = 'default';
const writer = CLS.createNamespace(namespace);

// 私有：获取当前threadLocal中的traceId
const getTraceId = function getTraceId() {
    const traceId = writer.get('trace-id');
    if (!traceId) {
        return genTraceId();
    }
    return traceId;
};

// 重新生成traceId
const genTraceId = function genTraceId() {
    const traceId = shortid.generate(5);
    writer.set('trace-id', traceId);
    return traceId;
};

const setTraceId = function setTraceId(traceId) {
    writer.set('trace-id', traceId);
    return traceId
}

module.exports = {
    createLogger,
    getTraceId,
    genTraceId,
    setTraceId,
    writer
};
