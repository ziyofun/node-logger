/**
 * @description 打印log基础组件
 */

import * as CLS from 'cls-hooked';
import * as shortid from 'shortid';
import { Logger } from 'winston';
import { Option } from '../type';
import { checkAndmkdirsSync, createWinston } from '../util';

const PWD = process.cwd();

// 默认配置
const DEFAULT_OPTIONS: Option = {
    name: 'logger',
    level: 'info',
    dir: PWD + '/logs',
    json: false,
    filename: 'app',
    console: true,
    writeFile: false,
    needErrorFile: false,
    autoTraceId: true,
    closeFile: false,
    datePattern: 'YYYYMMDD-'
};

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
function factory(options: Option): () => Logger {
    const logger = createWinston(options);

    // options 会保存在闭包中，返回此闭包函数，此函数作为实际使用中的主要对象
    return function (moduleName: string = '-') {
        // 若无日志文件夹则创建, 需要root权限
        checkAndmkdirsSync(options.dir);

        // 使用单例模式，使用相同 moduleName 可以有相同输出并保存在相同文件中，避免内存开销
        return logger.child({ filename: moduleName });
    }
}

// 以下方法使用async-wrap为日志添加异步调用间的唯一traceId功能
// 暂未支持多namespace功能
const namespace = 'default';
export const writer = CLS.createNamespace(namespace);

// 获取当前threadLocal中的traceId
export function getTraceId(): string {
    let traceId;
    writer.run(() => {
        traceId = writer.get('trace-id');
        if (!traceId) {
            traceId = genTraceId();
        }
    })
    return traceId;
};

// 重新生成traceId
export function genTraceId() {
    let traceId;
    writer.run(() => {
        traceId = shortid.generate();
        writer.set('trace-id', traceId);
    })
    return traceId;
};

// 主动设定traceId
export function setTraceId(traceId: string) {
    writer.run(() => {
        traceId = shortid.generate();
        writer.set('trace-id', traceId);
    })
    return traceId
}
