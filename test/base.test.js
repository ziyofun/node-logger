'use strict';


const { BaseLogger, CityServiceLogger } = require('../lib/logger');

let loggerOptions = {
    name: 'logger',     // logger实例的名字
    filename:"base",    // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'base-logger', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}

let baseLogger = new BaseLogger(loggerOptions);

baseLogger.info('baobaobao');