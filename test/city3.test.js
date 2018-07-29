"use strict";

let Koa = require('koa');
let app = new Koa();
const port = 3009;

const { BaseLogger, CityServiceLogger } = require('../lib/business/');

/*
let baseLogger = new BaseLogger("lzytest", {
    filename:"lzy",
    dir:'./logs2',
    app: 'lzy',
    console: true
});

baseLogger.setIP("127.0.0.1");
baseLogger.info("test base logger.")
baseLogger.info("test base logger 2.")
baseLogger.info("test base logger 3.")

let cityServiceLogger = new BaseLogger("lzytest2", {
    filename:"lzy2",
    dir:'./logs2',
    app: 'lzy2',
    console: true
});

cityServiceLogger.setIP("127.0.0.1");
cityServiceLogger.info("test city logger.")
cityServiceLogger.info("test city logger 2.")
cityServiceLogger.info("test city logger 3.")
*/

let loggerOptions = {
    name: 'logger',
    filename:"base",      // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'base-service', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}

let loggerOptions2 = {
    name: 'logger2',
    filename:"base2",      // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'base-service', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}


app.use(BaseLogger.middleware(loggerOptions)); // 1.实例名, 2. 配置
app.use(BaseLogger.middleware(loggerOptions2)); // 1.实例名, 2. 配置

let testJson = {
    a:"1234\n5678",
    b: [1,2,3]
}


app.use(async function handler(ctx, next) {
    if (ctx.url == '/') {
        
        ctx.logger.info('base logger test 1');
        ctx.logger2.info('base logger test 2');
        
        ctx.logger.debug('lzy');
        
        ctx.logger.error('error!!');
        
        ctx.body = 'city service!';
        
        await next();
    }
    
    if (ctx.url == '/debug') {
        
        ctx.logger.debug('lzy');
        
        ctx.body = 'City Service!';
    }
    
});

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});
