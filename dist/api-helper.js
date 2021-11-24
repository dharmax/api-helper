import { buildUrl } from './build-url';
const browser = typeof (window) !== 'undefined';
export let defaultBaseUrl = browser ? window.location.origin : 'localhost';
/**
 * You can define the spinner's appearance in the CSS class "spinner". No need to do anything more.
 */
const Spinner = browser && new class {
    constructor(spinnerElement = undefined) {
        this.spinnerElement = spinnerElement;
        this.counter = 0;
        if (this.spinnerElement)
            return;
        this.spinnerElement = document.body.getElementsByClassName('spinner')[0];
        if (!this.spinnerElement) {
            this.spinnerElement = document.createElement('div');
            this.spinnerElement.className = 'spinner';
            document.body.appendChild(this.spinnerElement);
        }
    }
    get spinner() {
        return this.spinnerElement;
    }
    show() {
        this.counter++;
        const s = this.spinner;
        if (s)
            s.style.visibility = 'visible';
    }
    hide() {
        if (--this.counter > 0)
            return;
        const s = this.spinner;
        if (s)
            s.style.visibility = 'hidden';
    }
};
export function setDefaultBaseUrl(url) {
    defaultBaseUrl = url;
}
export let errorReporter = (message) => {
    console.error(message);
};
export function setErrorReporter(reporter) {
    errorReporter = reporter;
}
export async function post(url, data, conf = {}) {
    return callApi(url, 'post', conf, data);
}
export async function remove(url, conf = {}) {
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
export async function put(url, data, conf = {}) {
    return callApi(url, 'put', conf, data);
}
/**
 * A generic REST call
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 */
export async function callApi(url, method = 'get', conf_ = {}, payload) {
    if (!conf_.headers)
        delete conf_.headers;
    const conf = {
        method,
        mode: 'cors',
        ...conf_
    };
    if (payload)
        setPayload(payload, conf);
    try {
        Spinner && Spinner.show();
        const response = await fetch(url, conf).then(r => r.json());
        if (response.error) {
            // noinspection ExceptionCaughtLocallyJS
            throw `${response.error}: ${response.message} (${response.statusCode})`;
        }
        return response;
    }
    catch (e) {
        const message = e.message || (typeof e == 'string' ? e : JSON.stringify(e));
        errorReporter(message);
        throw e;
    }
    finally {
        Spinner && Spinner.hide();
    }
}
/**
 * The generic Store abstraction. Derive your own store singleton per your REST resources from here.
 * It is meant to provide a clear, verb-based representation of resource. As it is, it provides the standard REST verbs,
 * out of the box, including the option to set different that the default base url, and custom headers, event without
 * overriding and method, but you should add your own methods that represents your specific semantics and data modeling
 * (in case it is different that the server's modeling) as well as caching and event broadcasting when relevant to you.
 */
export class StoreApi {
    /**
     *
     * @param resourceNameOrFullUrl
     * @param useDefaultBaseOrServiceRoot
     */
    constructor(resourceNameOrFullUrl, useDefaultBaseOrServiceRoot = true) {
        this.resourceNameOrFullUrl = resourceNameOrFullUrl;
        if (typeof useDefaultBaseOrServiceRoot === 'string')
            this.resourceUrl = useDefaultBaseOrServiceRoot + '/' + resourceNameOrFullUrl;
        else
            this.resourceUrl = useDefaultBaseOrServiceRoot ? defaultBaseUrl + '/' + this.resourceNameOrFullUrl : resourceNameOrFullUrl;
    }
    headerGenerator() {
        return null;
    }
    callApi({ method = 'get', pathParams, queryParams, payload }) {
        const headers = this.headerGenerator();
        const conf = headers ? { headers } : {};
        const url = buildUrl(this.resourceUrl, { path: pathParams, queryParams: queryParams });
        return callApi(url, method, conf, payload);
    }
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
     */
    create(entity, ...pathParams) {
        return this.post(entity, ...pathParams);
    }
    post(data, ...pathParams) {
        return this.callApi({
            method: "post",
            pathParams,
            payload: data
        });
    }
    /**
     * A formalization of an "operation" - it is a post, where the path params state the operation name
     * @param operationName
     * @param data
     * @param pathParams
     */
    operation(operationName, data, ...pathParams) {
        return this.post(data, ...[operationName, ...pathParams]);
    }
    /**
     * It is a get with an id - a formalization of "get entity by Id"
     * @param id
     * @param conf
     * @param pathParams
     */
    getEntity(id, conf, ...pathParams) {
        return this.get([id, ...pathParams], {});
    }
    get(pathParams, queryParams) {
        return this.callApi({
            method: "get",
            queryParams,
            pathParams: [...pathParams]
        });
    }
    /**
     * A formalized update
     * @param id
     * @param fields
     * @param pathParams
     */
    update(id, fields, ...pathParams) {
        return this.callApi({
            method: "put",
            pathParams,
            payload: fields
        });
    }
}
export function hello() {
    return 'hi';
}
