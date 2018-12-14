"use strict";
/**
 * @description 打印log基础组件
 */

const { format } = require('util');
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


const getContent = Symbol('getContent');
const getTraceId = Symbol('getTraceId');

class BaseLogger extends Winston {

    constructor(options = {}) {
        const context = {};

        options = Object.assign(options, DEFAULT_OPTIONS);

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

        super(context);

        this.context = context;

        context.traceId = this[getTraceId]();
        // 可以自动生成traceId
        if (!context.traceId) {
            if (options.autoTraceId === true) {
                // 从threadLocal中获取或者自动生成 traceId
                context.traceId = this.genTraceId(options);
            }
            else {
                context.traceId = PLACE_HOLDER;
            }
        }
    }

    // 设定模块名、label值
    set(property, value) {
        if (['module', 'label'].includes(property)) {
            this.context[property] = value;
        }
        return this;
    }
    // 获取模块名
    get(property) {
        if (['module', 'label'].includes(property)) {
            return this.context[property];
        } else {
            return void 0;
        }
    }

    /**
     * @description 所有打印方法
     * @param  {...any} args 日志打印参数
     */
    info(...args) {
        const curLog = this[getContent](...args);

        super.getInstance(this.context.name).info(curLog);
    }

    debug(...args) {
        const curLog = this[getContent](...args);

        super.getInstance(this.context.name).debug(curLog);
    }

    error(...args) {
        const curLog = this[getContent](...args);

        super.getInstance(this.context.name).error(curLog);
    }

    warn(...args) {
        const curLog = this[getContent](...args);

        super.getInstance(this.context.name).warn(curLog);
    }

    trace(...args) {
        const curLog = this[getContent](...args);

        super.getInstance(this.context.name).trace(curLog);
    }

    fatal(...args) {
        const curLog = this[getContent](...args);
        super.getInstance(this.context.name).fatal(curLog);
    }

    // 私有：使用固定变量包装打印日志
    [getContent](...args) {
        const content = format(...args);
        return `[${this.context.module.toUpperCase()}] ${this.context.traceId} ${this.context.label} ${this.context.api} ${this.context.method} | ${content}`;
    }

    // 私有：获取当前threadLocal中的traceId
    [getTraceId]() {
        const namespace = this.context['namespace'] || 'default';
        const ns = CLS.getNamespace(namespace);
        return ns && ns.get('trace-id');
    }

    // 重新生成traceId
    genTraceId() {
        const namespace = this.context['namespace'] || 'default';
        const writer = CLS.createNamespace(namespace);
        const traceId = shortid.generate(5);
        writer.run(() => {
            writer.set('trace-id', traceId);
        });

        console.log('traceId :: ', traceId);
        this.context.traceId = traceId;
        return traceId;
    }
}

module.exports = BaseLogger;
