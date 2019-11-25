/**
 * @description 打印log基础组件
 */

import * as shortid from 'shortid';
import * as CLS from 'cls-hooked';
import { Option, AsyncLogger } from '../type';
import { format as formatUtil } from 'util';
import { checkAndmkdirsSync, createWinston } from '../util';

const PLACE_HOLDER = '-';
const PWD = process.cwd();

// 默认配置
const DEFAULT_OPTIONS: Option = {
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
const METHOD_SUPPORTED: (keyof AsyncLogger)[] = ['info', 'debug', 'warn', 'error'];

// 基础日志组建
export function createLogger(options: Option) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    // 通过闭包返回各自模块的打印工具实例
    return factory(options);
}

/**
 * 传入一个日志配置，生产出一个函数，该函数可以接受一个`moduleName`参数来动态改变日志配置中的 filename 属性以及输出中的 moduleName 字段
 * 从而实现不同模块日志保存在不同的文件中且输入日志差异化的需求
 */
function factory(options: Option) {
    // options 会保存在闭包中，返回此闭包函数，此函数作为实际使用中的主要对象
    return function (moduleName: string = '-') {
        // 若无日志文件夹则创建, 需要root权限
        checkAndmkdirsSync(options.dir);

        // 更改文件名
        const optionsCopy = Object.assign({}, options);
        optionsCopy.filename = moduleName;

        // 使用单例模式，使用相同 moduleName 可以有相同输出并保存在相同文件中，避免内存开销
        const LoggerInstance = createWinston(optionsCopy);

        // 各引用使用的日志对象
        let logger: AsyncLogger = {
            info: () => {},
            warn: () => {},
            error: () => {},
            debug: () => {}
        };

        for (const method of METHOD_SUPPORTED) {
            /**
             * @description 所有打印方法
             * @param  {...any} args 日志打印参数
             */
            logger[method] = (...args: any[]) => {
                if (!LoggerInstance[method]) {
                    console.error('method %s not supported', method);
                }

                const curLog = format(moduleName, formatUtil(args[0], ...args.slice(1)));
                LoggerInstance[method](curLog)
            }
        }
        return logger;
    }

    // 添加自定义信息并以固定格式输出信息
    function format(moduleName: string, message: string): string {
        let traceId = '-';
        try {
            traceId = getTraceId();
            // 可以自动生成traceId
            if (!traceId && options.autoTraceId) {
                // 从threadLocal中获取或者自动生成 traceId
                traceId = genTraceId();
            }
        } catch (error) {
            // 在未创建options时可以实现忽略traceId的打印
            traceId = '-';
        }

        return `<${moduleName || PLACE_HOLDER}> {${traceId}} | ${message}`;
    }
}

// 以下方法使用async-wrap为日志添加异步调用间的唯一traceId功能
// 暂未支持多namespace功能
const namespace = 'default';
export const writer = CLS.createNamespace(namespace);

// 获取当前threadLocal中的traceId
export function getTraceId() {
    const traceId = writer.get('trace-id');
    if (!traceId) {
        return genTraceId();
    }
    return traceId;
};

// 重新生成traceId
export function genTraceId() {
    const traceId = shortid.generate();
    writer.set('trace-id', traceId);
    return traceId;
};

// 主动设定traceId
export function setTraceId(traceId: string) {
    writer.set('trace-id', traceId);
    return traceId
}
