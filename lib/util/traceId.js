'use strict';

const ip = require('ip');
const shortid = require('shortid');

class TraceId {
    constructor() {
    }

    generate() {
        
        let traceId = generate();
        
        return traceId;
    }
}

let ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';

let ID_LENGTH = 8;

let generate = function generate() {
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

/*
function ipToInt(ip) {
    const result = ip.split('.');
    result.reverse();
    return result.map((octet, index, array) => {
        return parseInt(octet) * Math.pow(256, (array.length - index - 1));
    }).reduce((prev, curr) => {
        return prev + curr;
    });
}
*/


module.exports = TraceId;
