const Logger = require('../index');

// var callsites = require('error-callsites')

// Logger.init({console: true, level: 'info'});

const logger = Logger.newLogger({api: '/user/helloworld'});

// console.log(stack.getStackInfo(8));
// var err = new Error('hello world');
// const call =callsites(err)[0];
// console.log(call.getFileName()+':'+call.getLineNumber() ) ;

// logger.info({a: 'aa'});
// logger.info('你好', {a: 'aa'});
logger.info('你好', {a: 'aa'});
logger.info('你好', {a: 'aa'});
// logger.debug('你好', {a: 'aa'});
// logger.warn('你好', {a: 'aa'});
// console.log('>>',require('json-stringify-safe')(new Error('hdfjfdgs')))

// logger.info('hfsdfs', undefined);
// logger.info('hfsdfs', {a: 'aaa'});
logger.error(new Error("hell"));

// setInterval(() => {
//     logger.error('ds', new Error('hello world'));
// }, 2000);

// console.log('>>>>>>>>', process.pid);
