'use strict';


const { BaseLogger } = require('../lib/logger');

let loggerOptions = {
    name: 'logger',
    filename:"base",
    dir:'./log3',
    level: 'info',
    console:true,       // 是否在console打印
}

let baseLogger = new BaseLogger(loggerOptions);
let baseLogger2 = new BaseLogger(loggerOptions);


baseLogger.setModule('lora');
baseLogger.info('city');
baseLogger.info('city');
baseLogger.info('city');
baseLogger.info('city');

baseLogger2.setModule('coap');
baseLogger2.info('iot');
baseLogger2.info('iot');
