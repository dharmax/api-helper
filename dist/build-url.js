"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUrl = void 0;
/**
 * Simply builds a URL.
 * @see URLOptions
 * @param baseUrl
 * @param options
 */
function buildUrl(baseUrl, options) {
    let queryString = [];
    let key;
    let builtUrl;
    if (baseUrl === null) {
        builtUrl = '';
    }
    else if (typeof (baseUrl) === 'object') {
        builtUrl = '';
        options = baseUrl;
    }
    else {
        builtUrl = baseUrl;
    }
    if (options) {
        if (options.path && options.path.length) {
            builtUrl += '/' + options.path.join('/');
        }
        if (options.queryParams) {
            for (key in options.queryParams) {
                if (options.queryParams.hasOwnProperty(key)) {
                    const value = options.queryParams[key];
                    if (value === null || value === undefined)
                        continue;
                    queryString.push(key + '=' + value);
                }
            }
            builtUrl += '?' + queryString.join('&');
        }
        if (options.hash) {
            builtUrl += '#' + options.hash;
        }
    }
    return builtUrl;
}
exports.buildUrl = buildUrl;
