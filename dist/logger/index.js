"use strict";
/**
 * @description 打印log基础组件
 */
Object.defineProperty(exports, "__esModule", { value: true });
var shortid = require("shortid");
var CLS = require("cls-hooked");
var util_1 = require("util");
var util_2 = require("../util");
var PLACE_HOLDER = '-';
var PWD = process.cwd();
// 默认配置
var DEFAULT_OPTIONS = {
    name: 'logger',
    level: 'info',
    dir: PWD + '/logs',
    filename: 'app',
    console: false,
    writeFile: false,
    needErrorFile: false,
    autoTraceId: true,
    closeFile: false,
    datePattern: 'YYYYMMDD-'
};
// 支持的打印方法
var METHOD_SUPPORTED = ['info', 'debug', 'warn', 'error'];
// 基础日志组建
function createLogger(options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);
    // 通过闭包返回各自模块的打印工具实例
    return factory(options);
}
exports.createLogger = createLogger;
/**
 * 传入一个日志配置，生产出一个函数，该函数可以接受一个`moduleName`参数来动态改变日志配置中的 filename 属性以及输出中的 moduleName 字段
 * 从而实现不同模块日志保存在不同的文件中且输入日志差异化的需求
 */
function factory(options) {
    // options 会保存在闭包中，返回此闭包函数，此函数作为实际使用中的主要对象
    return function (moduleName) {
        if (moduleName === void 0) { moduleName = '-'; }
        // 若无日志文件夹则创建, 需要root权限
        util_2.checkAndmkdirsSync(options.dir);
        // 更改文件名
        var optionsCopy = Object.assign({}, options);
        optionsCopy.filename = moduleName;
        // 使用单例模式，使用相同 moduleName 可以有相同输出并保存在相同文件中，避免内存开销
        var LoggerInstance = util_2.createWinston(optionsCopy);
        // 各引用使用的日志对象
        var logger = {
            info: function () { },
            warn: function () { },
            error: function () { },
            debug: function () { }
        };
        var _loop_1 = function (method) {
            /**
             * @description 所有打印方法
             * @param  {...any} args 日志打印参数
             */
            logger[method] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (!LoggerInstance[method]) {
                    console.error('method %s not supported', method);
                }
                var curLog = format(moduleName, util_1.format.apply(void 0, [args[0]].concat(args.slice(1))));
                LoggerInstance[method](curLog);
            };
        };
        for (var _i = 0, METHOD_SUPPORTED_1 = METHOD_SUPPORTED; _i < METHOD_SUPPORTED_1.length; _i++) {
            var method = METHOD_SUPPORTED_1[_i];
            _loop_1(method);
        }
        return logger;
    };
    // 添加自定义信息并以固定格式输出信息
    function format(moduleName, message) {
        var traceId = '-';
        try {
            traceId = getTraceId();
            // 可以自动生成traceId
            if (!traceId && options.autoTraceId) {
                // 从threadLocal中获取或者自动生成 traceId
                traceId = genTraceId();
            }
        }
        catch (error) {
            // 在未创建options时可以实现忽略traceId的打印
            traceId = '-';
        }
        return "<" + (moduleName || PLACE_HOLDER) + "> {" + traceId + "} | " + message;
    }
}
// 以下方法使用async-wrap为日志添加异步调用间的唯一traceId功能
// 暂未支持多namespace功能
var namespace = 'default';
exports.writer = CLS.createNamespace(namespace);
// 获取当前threadLocal中的traceId
function getTraceId() {
    var traceId = exports.writer.get('trace-id');
    if (!traceId) {
        return genTraceId();
    }
    return traceId;
}
exports.getTraceId = getTraceId;
;
// 重新生成traceId
function genTraceId() {
    var traceId = shortid.generate();
    exports.writer.set('trace-id', traceId);
    return traceId;
}
exports.genTraceId = genTraceId;
;
// 主动设定traceId
function setTraceId(traceId) {
    exports.writer.set('trace-id', traceId);
    return traceId;
}
exports.setTraceId = setTraceId;
