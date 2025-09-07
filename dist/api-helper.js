"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreApi = exports.errorReporter = exports.defaultBaseUrl = void 0;
exports.setDefaultBaseUrl = setDefaultBaseUrl;
exports.setErrorReporter = setErrorReporter;
exports.post = post;
exports.remove = remove;
exports.put = put;
exports.callApi = callApi;
const build_url_1 = require("./build-url");
const native_fetch_1 = require("native-fetch");
const spinner_1 = require("./spinner");
const browser_1 = require("./browser");
exports.defaultBaseUrl = browser_1.browser ? window.location.origin : 'localhost';
function setDefaultBaseUrl(url) {
    exports.defaultBaseUrl = url;
}
let errorReporter = (message) => {
    console.error(message);
};
exports.errorReporter = errorReporter;
function setErrorReporter(reporter) {
    exports.errorReporter = reporter;
}
async function post(url, data, conf = {}) {
    return callApi(url, 'post', conf, data);
}
async function remove(url, conf = {}) {
    return callApi(url, 'delete', conf);
}
function setPayload(data, conf) {
    if (typeof (data) === 'string') {
        let headers = conf.headers || new Headers();
        headers.set('Content-Type', 'html/text');
        conf.headers = headers;
        conf.body = data;
    }
    else
        conf.body = JSON.stringify(data);
}
async function put(url, data, conf = {}) {
    return callApi(url, 'put', conf, data);
}
const defaultRetryConfig = {
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 5000,
    timeout: 30000
};
async function callApi(url, method = 'get', conf_ = {}, payload, retryConfig = defaultRetryConfig) {
    if (!conf_.headers)
        delete conf_.headers;
    const conf = {
        method,
        mode: 'cors',
        ...conf_
    };
    if (payload)
        setPayload(payload, conf);
    let attempt = 0;
    while (true) {
        try {
            spinner_1.Spinner && spinner_1.Spinner.show();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), retryConfig.timeout);
            conf.signal = controller.signal;
            //@ts-ignore
            const response = await (0, native_fetch_1.fetch)(url, conf).then(r => r.json());
            clearTimeout(timeout);
            if (response.error) {
                throw `${response.error}: ${response.message} (${response.statusCode})`;
            }
            return response;
        }
        catch (e) {
            attempt++;
            const message = e.message || (typeof e == 'string' ? e : JSON.stringify(e));
            if (attempt >= (retryConfig.maxRetries || defaultRetryConfig.maxRetries)) {
                (0, exports.errorReporter)(message);
                throw e;
            }
            const delay = Math.min((retryConfig.initialRetryDelay || defaultRetryConfig.initialRetryDelay) * Math.pow(2, attempt - 1), retryConfig.maxRetryDelay || defaultRetryConfig.maxRetryDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        finally {
            spinner_1.Spinner && spinner_1.Spinner.hide();
        }
    }
}
/**
 * The generic Store abstraction. Derive your own store singleton per your REST resources from here.
 * It is meant to provide a clear, verb-based representation of resource. As it is, it provides the standard REST verbs,
 * out of the box, including the option to set different that the default base url, and custom headers, event without
 * overriding and method, but you should add your own methods that represents your specific semantics and data modeling
 * (in case it is different that the server's modeling) as well as caching and event broadcasting when relevant to you.
 */
class StoreApi {
    /**
     * Creates a new StoreApi instance. The resource name is used to build the full url to the resource.
     * @param resourceNameOrFullUrl the name of the resource or the full url to the resource
     * @param useDefaultBaseOrServiceRoot if true, the default base url will be used, otherwise the full url will be used
     * @see setDefaultBaseUrl
     */
    constructor(resourceNameOrFullUrl, useDefaultBaseOrServiceRoot = true) {
        this.resourceNameOrFullUrl = resourceNameOrFullUrl;
        if (typeof useDefaultBaseOrServiceRoot === 'string')
            this.resourceUrl = useDefaultBaseOrServiceRoot + '/' + resourceNameOrFullUrl;
        else
            this.resourceUrl = useDefaultBaseOrServiceRoot ? exports.defaultBaseUrl + '/' + this.resourceNameOrFullUrl : resourceNameOrFullUrl;
    }
    /**
     * Override this method to provide custom headers.
     */
    headerGenerator() {
        return null;
    }
    /**
     * A generic REST call.
     * @param method the method
     * @param pathParams the path params
     * @param queryParams the query params
     * @param payload the payload
     * @param conf the configuration for the fetch call (optional)
     * @param retryConfig
     * @see CallApiParameters, RequestInit
     */
    callApi({ method = 'get', pathParams, queryParams, payload, conf = {}, retryConfig = defaultRetryConfig }) {
        const headers = this.headerGenerator();
        headers && (conf.headers = Object.fromEntries(Object.entries(headers)));
        const url = (0, build_url_1.buildUrl)(this.resourceUrl, { path: pathParams, queryParams: queryParams });
        return callApi(url, method, conf, payload, retryConfig);
    }
    /**
     * A formalization of "delete an entity".
     * @param itemId the id of the entity to be deleted
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    remove(itemId, ...pathParams) {
        return this.callApi({
            method: 'delete',
            pathParams: [...pathParams, itemId.toString()]
        });
    }
    /**
     * A formalization of "create an entity".
     * @param entity
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    create(entity, ...pathParams) {
        return this.post(entity, ...pathParams);
    }
    /**
     * A formalization of "create an entity".
     * @param data
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    post(data, ...pathParams) {
        return this.callApi({
            method: "post",
            pathParams,
            payload: data
        });
    }
    /**
     * Formalization of an "operation" - it is a post, where the path params state the operation name
     * @param operationName
     * @param data
     * @param pathParams
     */
    operation(operationName, data, ...pathParams) {
        return this.post(data, ...[operationName, ...pathParams]);
    }
    /**
     * It is a get with an id - a formalization of a classic "get entity by Id"
     * @param id the id of the entity to be retrieved
     * @param conf the configuration for the fetch call (optional)
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    getEntity(id, conf, ...pathParams) {
        return this.get([id, ...pathParams], {});
    }
    /**
     * A formalization of "get an entity" but more free, allowing you to specify the path params and query params.
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @param queryParams the query params
     * @returns {Promise<T>}
     */
    get(pathParams, queryParams) {
        return this.callApi({
            method: "get",
            queryParams,
            pathParams: !pathParams ? [] : Array.isArray(pathParams) ? [...pathParams] : [pathParams]
        });
    }
    /**
     * A formalized update. update is a put, where the path params state the entity type and the id.
     * @param id the id of the entity to be updated
     * @param fields the fields to be updated. It can be a string or an object. When it is a string, it is assumed to be a json string, but it is really up to server implementation.
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    update(id, fields, ...pathParams) {
        return this.callApi({
            method: "put",
            pathParams,
            payload: fields
        });
    }
}
exports.StoreApi = StoreApi;
