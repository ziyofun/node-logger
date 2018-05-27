const winston = require('./winston');
const dynamicLevel = require('./dynamic_level');

// todo: 调试mocha
function canDebug() {
    return dynamicLevel.level == 'debug' ||
        ( !process.env.NODE_ENV ||
            process.env.NODE_ENV == 'qa' ||
            process.env.NODE_ENV == 'dev'
        )
}

module.exports = {
    winston,
    dynamicLevel,
    canDebug
};