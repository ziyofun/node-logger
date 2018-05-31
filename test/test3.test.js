

const { BaseLogger, CityService } = require('../lib/business/');

let baseLogger = new BaseLogger("lzytest", {
    filename:"aaa",
    dir:'./logs2',
    console:true,
});


// 设置ip
baseLogger.setIP("127.0.0.1");


baseLogger.info("test base logger.");