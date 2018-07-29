"use strict";

let Koa = require('koa');
let app = new Koa();
const port = 3009;

const { BaseLogger, CityServiceLogger } = require('../lib/business/');

let loggerOptions = {
    filename:"base",      // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'base-service', // 服务名
    console:true,       // 是否在console打印
}

app.use(BaseLogger.BaseLogger.middleware("logger", loggerOptions)); // 1.实例名, 2. 配置

let testJson = {
    a:"1234\n5678",
    b: [1,2,3]
}


app.use((ctx, next) => {
    if (ctx.url == '/') {
        
        ctx.logger.info('base logger test 1');
        
        ctx.logger.info('lzy');
        
        ctx.logger.error('error!!');
        
        ctx.body = 'city service!';
    }
    
    if (ctx.url == '/ping') {
        
        /*
        ctx.logger.debug('测试debug', {hello: 'city service'});
        ctx.logger.info('测试info', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.logger.warn('测试warn', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.logger.error('测试error', new Error('city service'));
        */
        
        ctx.body = 'City Service!';
    }
    
});

let server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});
