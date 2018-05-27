"use strict";

var Koa = require('koa');
var app = new Koa();
const port = 3009;

const loggerKoa = require('../lib/middleware/koa2');

app.use(loggerKoa({
    app:'test',
    
}));

app.use((ctx, next) => {
    if (ctx.url == '/') {
        ctx.logger.info('hello world');
        ctx.body = 'Hello World!';
    }

    if (ctx.url == '/ping') {
        ctx.logger.debug('测试debug', {hello: 'world'});
        ctx.logger.info('测试info', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
        ctx.logger.warn('测试warn', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
        ctx.logger.error('测试error', new Error('hell world'));
        ctx.body = 'Hello World!';
    }
});

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});