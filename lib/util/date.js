'use strict';

const moment = require('moment');

let getISODate = function getISODate(ts) {
    return moment(ts).toISOString();
}

module.exports = {
    getISODate,
}