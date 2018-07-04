"use strict";

var Koa = require('koa');
var app = new Koa();
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
    filename:"mw",      // 日志文件名前缀
    dir:'./log3',       // 日志文件目录
    app:'city-service', // 服务名
    console:true,       // 是否在console打印
}

let loggerOptions2 = {
    filename:"lzy-service",
    dir:'/data/log2',
    app:'lzy-service',
    level: 'error'
    //console:true,
}

app.use(CityServiceLogger.middleware("logger", loggerOptions)); // 1.实例名, 2. 配置
// app.use(BaseLogger.middleware("baseLogger", loggerOptions));

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

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});
