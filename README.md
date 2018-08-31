﻿#node-logger

一个通用日志库, 可配置多个日志, 日志文件名, 路径, level, 可在服务运行时动态修改日志level

支持koa中间件模式, 中间件模式下, 可以使用traceId进行日志分析


## 使用方式
### 配置文件
```
{
    datePattern: 'YYYYMMDD-',   // 日志文件名时间格式
    isDatePrefix: true,         // 日志文件名时间是否是前缀
    name: 'logger',             // logger实例的名字
    filename:"test",            // 日志文件名filename部分
    dir:'./log',                // 日志文件目录
    level: 'info',              // 最低日志等级
    console:true,               // 是否在console打印
    needErrorFile: true,        // 是否同时生成-error.log日志
}

```
配置datePattern, isDatePrefix和filename, 构造日志文件的名称, 模块自动添加.log后缀, 例如
```
datePattern: 'YYYYMMDD-',
isDatePrefix: true,
filename: 'app'
```
生成的日志文件名为20180830-app.log
```
datePattern: '-YYYY-MM-DD',
isDatePrefix: false,
filename: 'city-app'
```
生成的日志文件名为city-app-2018-08-30.log
支持使用多个配置文件, 定向不同的日志文件
dir为日志存放的文件夹
console为cmd打印开关
needErrorFile为是否同时生成error.log日志. 如果设为true, 则在生成已配置的日志文件的同时, 生成只收集error日志的-error.log文件.如:
20180830-app.log
20180830-app-error.log
name为日志实例的名称

### koa中间件
支持koa中间件, 添加中间件后, ctx[name]将是日志实例.如:
```
配置文件:
{
    ...
    name: 'myLogger'
    ...
}

controller层代码:
...
ctx.myLogger.info('test');
...
```
中间件模式下, 一次完成的调用下, traceId会保持相同, 并且区分与其他调用. 如:
```
2018-08-31T04:11:11.999Z info root ukxsdF1P / GET base logger test 1
2018-08-31T04:11:12.002Z info root ukxsdF1P / GET i am a template added by nathan but not lzy, haha!
2018-08-31T04:11:12.002Z error root ukxsdF1P / GET error!!
2018-08-31T04:11:13.553Z info root uX4rGHPA / GET base logger test 1
2018-08-31T04:11:13.553Z info root uX4rGHPA / GET i am a template added by nathan but not lzy, haha!
2018-08-31T04:11:13.553Z error root uX4rGHPA / GET error!!

```
以上日志是分别在04:11:12和04:11:15两个时间左右, 连续调用两次接口, 通过两个不同的traceId, ukxsdF1P和uX4rGHPA可以定位两次不同的服务调用
### 动态修改日志等级
支持在不重启服务的条件下, 动态修改日志等级, 目前只开放info -> debug, debug -> info两种模式, SIGUSR1将level设置为debug, SIGUSR2将level设置为info, 如:
代码文件:
```
ctx.logger.info('base logger test 1');
ctx.logger.info('i am a template added by %s', 'nathan', 'but not lzy, haha!')
ctx.logger.debug('lzy');
ctx.logger.error('error!!');
ctx.logger.debug('debug');

```
默认的info级别下日志
```
2018-08-31T04:11:13.553Z info root uX4rGHPA / GET base logger test 1
2018-08-31T04:11:13.553Z info root uX4rGHPA / GET i am a template added by nathan but not lzy, haha!
2018-08-31T04:11:13.553Z error root uX4rGHPA / GET error!!
```
发送SIGUSR1信号, kill -SIGUSR1 64458, 下图可见debug日志
```
2018-08-31T04:17:12.310Z info root Q_aupjz4 / GET base logger test 1
2018-08-31T04:17:12.311Z info root Q_aupjz4 / GET i am a template added by nathan but not lzy, haha!
2018-08-31T04:17:12.311Z debug root Q_aupjz4 / GET lzy
2018-08-31T04:17:12.311Z error root Q_aupjz4 / GET error!!
2018-08-31T04:17:12.311Z debug root Q_aupjz4 / GET debug
```
发送SIGUSR2信号, kill -SIGUSR2 64458, debug日志不再记录
```
2018-08-31T04:21:38.135Z info root ojI8zMa0 / GET base logger test 1
2018-08-31T04:21:38.136Z info root ojI8zMa0 / GET i am a template added by nathan but not lzy, haha!
2018-08-31T04:21:38.136Z error root ojI8zMa0 / GET error!!
2018-08-31T04:21:38.136Z info - aEqBwAJU / GET base logger test 2
```
目前信号设置level的方式, 为全局设置

## 日志格式
```
${Time} ${level} ${moduleName} ${traceId} ${api} ${method} ${content}
```
Time: 日志时间, 格式为ISODate
level: 日志等级, 支持trace, debug, info(默认等级), warn, error
moduleName: 模块名, 由编程人员决定填写
traceId: 8位字符串, 由A-Z, a-z, 0-9, _-组成
api: 调用那个服务的api, http业务中, 特指path
method: http的方法
content: 日志内容

其中moduleName在代码中设置, 如
```
ctx.logger.setModule('root');
```
如果不设置, 则使用占位符

## 代码示例
### 直接使用日志实例
```
'use strict';


const { BaseLogger } = require('@sensoro/node-logger');

let loggerOptions = {
    name: 'logger',
    filename:"base",
    dir:'./log',
    level: 'info',
    console:true,
}

let baseLogger = new BaseLogger(loggerOptions);
let baseLogger2 = new BaseLogger(loggerOptions);


baseLogger.setModule('lora');
baseLogger.info('city');
baseLogger.info('city');
baseLogger.info('city');
baseLogger.info('city');

baseLogger2.setModule('coap');
baseLogger2.info('iot');
baseLogger2.info('iot');
```
###中间件方式
```
"use strict";


let Koa = require('koa');
let app = new Koa();
const port = 3009;

const { BaseLogger } = require('@sensoro/node-logger');




let loggerOptions = {
    datePattern: 'YYYYMMDD-',   // 日志文件名时间格式
    isDatePrefix: true,         // 日志文件名时间是否是前缀
    name: 'logger',             // logger实例的名字
    filename:"test",            // 日志文件名filename部分
    dir:'./log',                // 日志文件目录
    level: 'info',              // 最低日志等级
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

```