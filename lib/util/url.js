'use strict';


/**
 * 构造uri
 * @param method
 * @param url
 * @returns {*}
 */
let getUri = function getUri(method, url) {
    let uri;
    
    let index = url.lastIndexOf('?');
    if (index >= 0) {
        uri = url.slice(0, url.lastIndexOf('?'));
    }
    else {
        uri = url;
    }
    
    return uri;
};


module.exports = {
    getUri: getUri,
}