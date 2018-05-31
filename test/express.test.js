"use strict";

var express = require('express');
var app = express();
const Logger = require('../lib/business/base-logger');

const loggerExpress = require('../lib/middleware/express');

Logger.winstonInit({console: true});

app.use(loggerExpress({
    parseToken: function (req) {
        return 9527;
    }
}));

app.get('/', function (req, res) {
    req.logger.info('hello world');
    res.send('Hello World!');
});

app.get('/ping', function (req, res) {
    req.logger.debug('测试debug', {hello: 'world'});
    req.logger.info('测试info', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
    req.logger.warn('测试warn', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
    req.logger.error('测试error', new Error('hell world'));
    res.send('Hello World!');
});

app.get('/v1/ping', function (req, res) {
    req.logger.debug('测试debug', {hello: 'world'});
    req.logger.info('测试info', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
    req.logger.warn('测试warn', {userId: 21343, info: 'hello world'}, {userId: 21343, info: 'hello world'});
    req.logger.error('测试error', new Error('hell world'));
    res.send('Hello World!');
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});