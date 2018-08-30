"use strict";


let Koa = require('koa');
let app = new Koa();
const port = 3009;

const { PreviousLogger } = require('../lib/logger');


let loggerOptions3 = {
    //datePattern: 'YYYYMMDD-',
    // isDatePrefix: true,
    name: 'logger3',     // logger实例的名字
    filename:"app",    // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'city-logger', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}

let loggerOptions4 = {
    datePattern: '-YYYY-MM-DD',
    isDatePrefix: false,
    name: 'logger4',    // logger实例的名字
    filename:"app2",   // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'base-logger', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}

/*
let loggerOptions = {
    datePattern: 'YYYYMMDD-',
    isDatePrefix: true,
    name: 'logger',     // logger实例的名字
    filename:"app",    // 日志文件名前缀
    dir:'./log',       // 日志文件目录
    app:'base-logger', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
    needErrorFile: true,
}

let loggerOptions2 = {
    datePattern: '-YYYY-MM-DD',
    isDatePrefix: false,
    name: 'logger2',     // logger实例的名字
    filename:"app",    // 日志文件名前缀
    dir:'./log',       // 日志文件目录
    app:'base-logger', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}
*/


app.use(PreviousLogger.middleware(loggerOptions3)); // 1.实例名, 2. 配置
app.use(PreviousLogger.middleware(loggerOptions4)); // 1.实例名, 2. 配置

app.use(async function handler(ctx, next) {
    if (ctx.url == '/') {

        ctx.logger3.info('base logger test 1');
        
        ctx.logger3.info('i am a template added by %s', 'nathan', 'but not lzy, haha!')
        ctx.logger3.info('json: %j, string: %s', {a:1, b:2}, "abc");
        ctx.logger3.debug('debug');
    
        ctx.logger4.info('base logger test 2');
        
        ctx.body = 'city logger!';

        await next();
    }
    
    if (ctx.url == '/debug') {
        
        // ctx.logger.debug('lzy');
        
        ctx.body = 'City Service!';
    }
    if (ctx.url === '/debug') {
        ctx.body = useDebug;
    }
    if (ctx.url === '/trace') {
        ctx.body = useTrace;
    }
});

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});


