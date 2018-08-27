"use strict";


let Koa = require('koa');
let app = new Koa();
const port = 3009;

// const { CityServiceLogger } = require('../lib/business/');
const { CityServiceLogger } = require('../lib/logger');

let loggerOptions = {
    name: 'logger',     // logger实例的名字
    filename:"city",    // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'city-logger', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}

let loggerOptions2 = {
    name: 'logger2',    // logger实例的名字
    filename:"city",   // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'base-logger', // 服务名
    level: 'info',
    console:true,       // 是否在console打印
}



app.use(CityServiceLogger.middleware(loggerOptions)); // 1.实例名, 2. 配置
app.use(CityServiceLogger.middleware(loggerOptions2)); // 1.实例名, 2. 配置


app.use(async function handler(ctx, next) {
    if (ctx.url == '/') {

        ctx.logger.info('base logger test 1');
        ctx.logger.info('i am a template added by %s', 'nathan', 'but not lzy, haha!')
        ctx.logger.info('json: %j, string: %s', {a:1, b:2}, "abc");
        ctx.logger.debug('debug');
    
        ctx.logger2.info('base logger test 2');
        
        /*
        ctx.logger.debug('lzy');

        ctx.logger.error('error!!');
        */

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


