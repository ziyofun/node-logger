##node-logger

一个通用日志库, 可配置多个日志, 日志文件名, 路径, level, 可在服务运行时动态修改日志level

支持koa中间件模式, 中间件模式下, 可以使用traceId进行日志分析

### 日志规范

##http://wiki

### 日志格式

${Time} ${level} ${moduleName} ${traceId} ${api} ${method} ${content}

Time: ISODate类型时间
level: 日志等级, trace, 
