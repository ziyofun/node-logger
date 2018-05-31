"use strict";

var Koa = require('koa');
var app = new Koa();
const port = 3009;

const { BaseLogger} = require('../lib/business/');

let baseLogger = new BaseLogger("lzytest", {
    filename:"lzy",
    dir:'./logs2'
});

baseLogger.setIP("127.0.0.1");
baseLogger.info("test base logger.")

let loggerOptions = {
    filename:"mw",
    dir:'./log3',
    app:'mw',
    console:true,
}

let loggerOptions2 = {
    filename:"lzy-service",
    dir:'/data/log2',
    app:'lzy-service',
    level: 'error'
    //console:true,
}

app.use(BaseLogger.middleware("baseLogger", loggerOptions));
//app.use(BaseLogger.middleware("lzyTest", loggerOptions2));

let testJson = {
    a:"1234\n5678",
    b: [1,2,3]
}


app.use((ctx, next) => {
    if (ctx.url == '/') {
        
        // ctx.cityLogger.setBusinessType("lzyTest").info('city service');
        ctx.baseLogger.info('base logger test 1');
        
        /*
        // test error
        ctx.lzyTest.setBusinessType("lzyTest2").error('city service 2');
        ctx.lzyTest.error('city service 3');
        */
        
        // test info
        // ctx.lzyTest.setBusinessType("lzyTest2").info('city service 2');
        // ctx.lzyTest.info('city service 3');
        
        ctx.body = 'city service!';
    }
    
    if (ctx.url == '/ping') {
        
        /*
        ctx.logger.debug('测试debug', {hello: 'city service'});
        ctx.logger.info('测试info', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.logger.warn('测试warn', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.logger.error('测试error', new Error('city service'));
        */
        
        ctx.cityLogger.debug('测试debug', {hello: 'city service'});
        ctx.cityLogger.info('测试info', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.cityLogger.warn('测试warn', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.cityLogger.error('测试error', new Error('city service'));
        
        ctx.body = 'City Service!';
    }
    
});

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});