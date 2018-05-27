"use strict";

var Koa = require('koa');
var app = new Koa();
const Logger = require('../lib/business/baselogger');
const port = 3009;

const loggerKoa = require('../lib/middleware/koa1');

Logger.winstonInit({console: true});

app.use(loggerKoa());

app.use(function* () {
    if (this.url == '/') {
        this.logger.info('hello world');
        this.body = 'Hello World!';
    }

    if (this.url == '/ping') {
        this.logger.debug('测试debug', {hello: 'world'});
        this.logger.info('测试info', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
        this.logger.warn('测试warn', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
        this.logger.error('测试error', new Error('hell world'));
        this.body = 'Hello World!';
    }
});

var server = app.listen(port, function () {
    console.log(`服务程序在${port}端口启动`);
});