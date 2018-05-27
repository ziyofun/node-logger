"use strict";

var Koa = require('koa');
var app = new Koa();
const port = 3009;

const { CityService } = require('../lib/business/');

app.use(CityService.middleware({
    dir:'/data/log',
    app:'city-service',
}));

app.use((ctx, next) => {
    if (ctx.url == '/') {
        ctx.logger.info('city service');
        ctx.body = 'city service!';
    }
    
    if (ctx.url == '/ping') {
        ctx.logger.debug('测试debug', {hello: 'city service'});
        ctx.logger.info('测试info', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.logger.warn('测试warn', {userId: 21343, info: 'city service'}, {userId: 21343, info: 'city service'});
        ctx.logger.error('测试error', new Error('city service'));
        ctx.body = 'City Service!';
    }
});

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});