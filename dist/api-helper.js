import { buildUrl } from './build-url';
export let defaultBaseUrl = window.location.origin;
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
    return callApi(url, 'post', Object.assign(conf_, {
        body: JSON.stringify(data)
    }));
}
export async function remove(url, conf_ = {}) {
    return callApi(url, 'delete');
}
export async function put(url, data, conf_ = {}) {
    return callApi(url, 'put', Object.assign(conf_, {
        body: JSON.stringify(data)
    }));
}
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
/**
 * A generic REST call
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 */
export async function callApi(url, method = 'get', conf_ = {}) {
    const conf = {
        ...conf_,
        method,
        mode: 'cors',
        headers: new Headers({
            'session-token': localStorage.sessionToken,
            'Content-Type': 'application/json'
        })
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
        this.resourceUrl = useDefaultBase ? defaultBaseUrl + '/' + this.resourceNameOrFullUrl : resourceNameOrFullUrl;
    }
    load(opt_, ...pathParams) {
        const opt = { ...opt_ };
        opt.queryParams && (opt.queryParams = JSON.stringify(opt.queryParams));
        return callApi(buildUrl(this.resourceUrl, {
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
        return callApi(buildUrl(`${this.resourceUrl}${id ? '/' + id : ''}`, {
            path: pathParams,
            queryParams: opts
        }));
    }
    get(pathParams, queryParams) {
        return callApi(buildUrl(this.resourceUrl, {
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
