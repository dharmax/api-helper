import {buildUrl} from './build-url';

export let defaultBaseUrl = window.location.origin;
const Spinner = new class {
    constructor(spinnerElement = undefined) {
        this.spinnerElement = spinnerElement;
        this.counter = 0;
        if (this.spinnerElement)
            return;
        this.spinnerElement = document.body.getElementsByClassName('spinner')[0];
        if (!this.spinnerElement) {
            this.spinnerElement = document.createElement('div');
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
export async function post(url, data, conf_ = {}) {
    const isRaw = fixContentType(data, conf_);
    return callApi(url, 'post', {
        ...conf_,
        body: isRaw ? data : JSON.stringify(data)
    });
}
export async function remove(url, conf_ = {}) {
    return callApi(url, 'delete', conf_);
}
function fixContentType(data, conf_) {
    const isRaw = typeof (data) === 'string';
    if (isRaw) {
        let headers = conf_.headers || new Headers();
        headers.set('Content-Type', 'html/text');
        conf_.headers = headers;
    }
    return isRaw;
}
export async function put(url, data, conf_ = {}) {
    const isRaw = fixContentType(data, conf_);
    return callApi(url, 'put', {
        ...conf_,
        body: isRaw ? data : JSON.stringify(data)
    });
}
/**
 * A generic REST call
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 */
export async function callApi(url, method = 'get', conf_ = {}) {
    if (!conf_.headers)
        delete conf_.headers;
    const conf = {
        method,
        mode: 'cors',
        headers: new Headers({
            'session-token': localStorage.sessionToken,
            'Content-Type': 'application/json'
        }),
        ...conf_
    };
    try {
        Spinner.show();
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
        Spinner.hide();
    }
}
/**
 * The generic Store abstraction. Derive your own store singleton per your REST resources from here.
 */
export class StoreApi {
    constructor(resourceNameOrFullUrl, useDefaultBase = true) {
        this.resourceNameOrFullUrl = resourceNameOrFullUrl;
        /**
         * Can be overridden to create JWT or whatever
         */
        this.headerGenerator = () => {
            return null;
        };
        this.resourceUrl = useDefaultBase ? defaultBaseUrl + '/' + this.resourceNameOrFullUrl : resourceNameOrFullUrl;
    }
    callApi(url, method = 'get', conf_ = {}) {
        const headers = this.headerGenerator();
        conf_.headers = conf_.headers || this.headerGenerator();
        return callApi(url, method, conf_);
    }
    load(opt_, ...pathParams) {
        const opt = {...opt_};
        opt.queryParams && (opt.queryParams = JSON.stringify(opt.queryParams));
        return this.callApi(buildUrl(this.resourceUrl, {
            queryParams: opt,
            path: pathParams
        }));
    }
    remove(itemId, ...pathParams) {
        pathParams = pathParams || [];
        return remove([this.resourceUrl, ...pathParams, itemId].join('/'));
    }
    create(entity, ...pathParams) {
        return post(this.resourceUrl + ['', ...pathParams].join('/'), entity);
    }
    operation(operationName, data, ...pathParams) {
        return post(this.resourceUrl + ['', operationName, ...pathParams].join('/'), data);
    }
    getEntity(id, opts, ...pathParams) {
        return this.callApi(buildUrl(`${this.resourceUrl}${id ? '/' + id : ''}`, {
            path: pathParams,
            queryParams: opts
        }));
    }
    get(pathParams, queryParams) {
        return this.callApi(buildUrl(this.resourceUrl, {
            path: Array.isArray(pathParams) ? pathParams : [pathParams],
            queryParams: queryParams
        }));
    }
    update(id, fields, ...pathParams) {
        return put(buildUrl(`${this.resourceUrl}${id ? '/' + id : ''}`, {
            path: pathParams
        }), fields);
    }
}
