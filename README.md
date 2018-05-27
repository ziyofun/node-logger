##node-logger 
> 一个通用的日志标准库，为Node应用提供一个统一标准

### 日志规范

##http://wiki

### 日志格式
yyyy-MM-dd HH:mm:ss.SSS Level appName TraceId  pid API -(冗余占位符) 日志信息建议JSON


### 怎么使用

```json
{
"node-logger": "a"
}
```



### 中间支持

1. express
2. koa

### Demo
```

```


#### TraceId Http header 
> x-trace-id
> sensoro-trace-id


#### 动态日志调整

发送`SIGUSR1`信号开启debug level  
``kill -SIGUSR1 pid``  
发送`SIGUSR2`信号开启info level  
``kill -SIGUSR2 pid``  

#### Contributor



