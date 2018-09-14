"use strict";

const { BaseLogger } = require("./lib/logger");
const Middleware = require("./lib/middleware/middleware");
const { globalWinstonInstance } = require('./lib/service/winston');

module.exports = {
    BaseLogger,
    globalWinstonInstance,
    Middleware,
};
