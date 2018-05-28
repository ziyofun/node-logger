"use strict";

const ip = require("ip");

let getLocalIp = function getLocalIp() {
    return ip.address();
};

module.exports = {
    getLocalIp,
}