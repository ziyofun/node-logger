﻿# city-logger

一个支持 traceId 的日志组建


## 使用方式
### 配置文件
```
{
    datePattern: 'YYYYMMDD-',   // 日志文件名时间格式
    isDatePrefix: true,         // 日志文件名时间是否是前缀
    name: 'logger',             // logger实例的名字
    filename:"test",            // 日志文件名filename部分
    dir:'/log',                // 日志文件目录，使用绝对路径
    level: 'info',              // 最低日志等级
    console:true,               // 是否在console打印
    needErrorFile: true,        // 是否同时生成-error.log日志
}

```

### 配置方式
```javascript
    // logger.js

    const config = require('config');
    const path = require('path');
    const { Logger } = require('@sensoro/city-logger');

    /**
    * require('./log')(name)
    *
    * @return {Function} log
    */
    module.exports = function(name) {
        const options = Object.assign({}, config.logger);

        // 组织一个绝对路径传入组件
        options.dir = path.join(`${__dirname}/../../${config.logger.dir}`);
        return Logger(config.logger)(name);
    };
```

### 使用方式

```javascript
    // server.js
    const Koa = require('koa');
    const { genTraceId, ns } = require('@sensoro/city-logger');

    const logger = require('./logger.js')('servers');

    const { middleware1 } = require('./slave1.js');
    const { middleware2 } = require('./slave2.js');

    const app = new Koa();

    ns.run(() => {
        // 生成traceId
        app.use(async(ctx, next) => {
            genTraceId();
            logger.info()
            await middleware1();
            await middleware2();
            await next();
        });
    })
```

```javascript
    // slave1.js
    const logger = require('./logger.js')('foo-bar');

    exports.middleware1 = async(ctx, next) => {
        logger.info('this is a middleware');

        await next();
    });
```

```javascript
    // slave2.js
    const logger = require('./logger.js')('foo-bar');

    exports.middleware2 = async(ctx, next) => {
        logger.info('this is another middleware');

        await next();
    });
```

