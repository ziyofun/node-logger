'use strict';


/**
 * 构造uri
 * @param method
 * @param url
 * @returns {*}
 */
let buildUri = function buildUri(method, url) {
    let uri;
    
    if (method.toLowerCase() === "get") {
        let index = url.lastIndexOf('?');
        if (index >= 0) {
            uri = url.slice(0, url.lastIndexOf('?'));
        }
        else {
            uri = url;
        }
    }
    else {
        uri = url;
    }
    
    return uri;
};

module.exports = {
    buildUri,
}