const winston = require('winston');
const transports = winston.transports;

winston.add(winston.transports.File, { filename: 'somefile.log' });

const dynamicTransports = [];

function buildDynamicTransports(dynamicTransports) {
    // Console, File, Http etc.
    for (let idx in transports) {
        if (!transports.hasOwnProperty(idx)) {
            continue;
        }
        let curTransport = transports[idx];
        
        transports[idx] = function (...args) {
            let curTransportInstance = new curTransport(...args);
            dynamicTransports.push(curTransportInstance);
            return curTransportInstance;
        }
    }
}

buildDynamicTransports(dynamicTransports);

function setLevel(level) {
    module.exports.level = level;
    for (let idx in dynamicTransports) {
        if (!dynamicTransports.hasOwnProperty(idx)) {
            continue;
        }
        let transport = dynamicTransports[idx];
        transport.level = level;
    }
}

process.on('SIGUSR1', function () {
    setLevel('debug');
});

process.on('SIGUSR2', function () {
    setLevel('info');
});


module.exports = {
    level: null
};


