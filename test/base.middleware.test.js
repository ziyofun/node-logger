"use strict";


let Koa = require('koa');
let app = new Koa();
const port = 3009;

const { BaseLogger } = require('../lib/logger');


let loggerOptions = {
    datePattern: 'YYYYMMDD-',   // 日志文件名时间格式
    isDatePrefix: true,         // 日志文件名时间是否是前缀
    name: 'logger',             // logger实例的名字
    filename:"test",             // 日志文件名filename部分
    dir:'./log',                // 日志文件目录
    level: 'info',
    console:true,               // 是否在console打印
    needErrorFile: true,        // 是否同时生成-error.log日志
}

let loggerOptions2 = {
    datePattern: '-YYYY-MM-DD',
    isDatePrefix: false,
    name: 'logger2',
    filename:"app",
    dir:'./log',
    level: 'info',
    console:true,
}


app.use(BaseLogger.middleware(loggerOptions));
app.use(BaseLogger.middleware(loggerOptions2));

app.use(async function handler(ctx, next) {
    if (ctx.url == '/') {

        ctx.logger.setModule('root');
        ctx.logger.info('base logger test 1');
        ctx.logger.info('i am a template added by %s', 'nathan', 'but not lzy, haha!')
        ctx.logger.debug('lzy');
        ctx.logger.error('error!!');
        ctx.logger.debug('debug');

        ctx.logger2.info('base logger test 2');

        ctx.body = 'city logger!';
        
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
