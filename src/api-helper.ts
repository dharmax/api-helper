import {buildUrl} from './build-url'
import {fetch as nativeFetch} from 'native-fetch'
import {Spinner} from './spinner'
import {browser} from './browser'

let fetchImpl = nativeFetch

export let defaultBaseUrl = browser ? window.location.origin : 'localhost'


export function setDefaultBaseUrl(url: string) {
    defaultBaseUrl = url
}

export interface IReadOptionsFront {
    from: number
    count: number
    entityOnly?: boolean
    queryName?: string
    queryParams?: Object
    sort?: string
    projection?: string[]

    [x: string]: any
}

export interface IReadResult {
    error?: string
    items: any[]
    total?: number
    totalFiltered: number
    opts?: any
}

export let errorReporter = (message: string) => {
    console.error(message)
}

export function setErrorReporter(reporter: (s: string) => any) {
    errorReporter = reporter
}

export function setFetchImplementation(fetch: typeof nativeFetch) {
    fetchImpl = fetch
}

export async function post(url: string, data: object | string, conf: RequestInit = {}) {
    return callApi(url, 'post', conf, data)
}

export async function remove(url: string, conf: RequestInit = {}) {
    return callApi(url, 'delete', conf)
}


function setPayload(data: object | string, conf: RequestInit): void {

    if (typeof (data) === 'string') {
        let headers = conf.headers as Headers || new Headers()
        headers.set('Content-Type', 'html/text')
        conf.headers = headers
        conf.body = data
    } else
        conf.body = JSON.stringify(data)
}

export async function put(url: string, data: object | string, conf: any = {}) {
    return callApi(url, 'put', conf, data)
}


/**
 * A generic REST call that can be used to call any REST service.
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 * @param payload the payload
 * @returns {Promise<any>}
 */
export interface RetryConfig {
    maxRetries?: number;
    initialRetryDelay?: number;
    maxRetryDelay?: number;
    timeout?: number;
}

const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 5000,
    timeout: 30000
};

export async function callApi<T>(
    url: string,
    method: 'post' | 'get' | 'delete' | 'put' = 'get',
    conf_: RequestInit = {},
    payload?: string | Object,
    retryConfig: RetryConfig = defaultRetryConfig
): Promise<T | Response> {
    if (!conf_.headers)
        delete conf_.headers
    const conf: RequestInit = {
        method,
        mode: 'cors',
        ...conf_
    }
    if (payload)
        setPayload(payload, conf)

    let attempt = 0;
    while (true) {
        try {
            Spinner && Spinner.show();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), retryConfig.timeout);

            conf.signal = controller.signal;
            //@ts-ignore
            const response = await fetchImpl(url, conf)
            clearTimeout(timeout);

            if (!response.ok) {
                throw `HTTP Error ${response.status}: ${response.statusText}`;
            }
            // @ts-ignore
            return method === 'delete' ? response : await response.json();
        } catch (e: any) {
            attempt++;
            const message = e.message || (typeof e == 'string' ? e : JSON.stringify(e));

            if (attempt >= (retryConfig.maxRetries || defaultRetryConfig.maxRetries!)) {
                errorReporter(message);
                throw e;
            }

            const delay = Math.min(
                (retryConfig.initialRetryDelay || defaultRetryConfig.initialRetryDelay!) * Math.pow(2, attempt - 1),
                retryConfig.maxRetryDelay || defaultRetryConfig.maxRetryDelay!
            );
            await new Promise(resolve => setTimeout(resolve, delay));
        } finally {
            Spinner && Spinner.hide();
        }
    }
}

interface CallApiParameters {
    method: 'post' | 'get' | 'delete' | 'put'
    pathParams?: string[]
    queryParams?: { [x: string]: string } | undefined
    payload?: string | Object
    conf?: RequestInit
    retryConfig?: RetryConfig
}

/**
 * The generic Store abstraction. Derive your own store singleton per your REST resources from here.
 * It is meant to provide a clear, verb-based representation of resource. As it is, it provides the standard REST verbs,
 * out of the box, including the option to set different that the default base url, and custom headers, event without
 * overriding and method, but you should add your own methods that represents your specific semantics and data modeling
 * (in case it is different that the server's modeling) as well as caching and event broadcasting when relevant to you.
 */
export class StoreApi {
    protected readonly resourceUrl: string;

    /**
     * Creates a new StoreApi instance. The resource name is used to build the full url to the resource.
     * @param resourceNameOrFullUrl the name of the resource or the full url to the resource
     * @param useDefaultBaseOrServiceRoot if true, the default base url will be used, otherwise the full url will be used
     * @see setDefaultBaseUrl
     */
    constructor(protected resourceNameOrFullUrl: string, useDefaultBaseOrServiceRoot: boolean | string = true) {
        if (typeof useDefaultBaseOrServiceRoot === 'string')
            this.resourceUrl = useDefaultBaseOrServiceRoot + '/' + resourceNameOrFullUrl
        else
            this.resourceUrl = useDefaultBaseOrServiceRoot ? defaultBaseUrl + '/' + this.resourceNameOrFullUrl : resourceNameOrFullUrl

    }

    /**
     * Override this method to provide custom headers.
     */
    headerGenerator(): Object | null {
        return null
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
    callApi<T>({
                   method = 'get',
                   pathParams,
                   queryParams,
                   payload,
                   conf = {},
                   retryConfig = defaultRetryConfig
               }: CallApiParameters): Promise<T> {
        const headers = this.headerGenerator()
        headers && (conf.headers = Object.fromEntries(Object.entries(headers)))
        const url = buildUrl(this.resourceUrl, {path: pathParams, queryParams: queryParams})
        return callApi(url, method, conf, payload, retryConfig) as Promise<T>
    }

    /**
     * A formalization of "delete an entity".
     * @param itemId the id of the entity to be deleted
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    remove<T>(itemId: string | number, ...pathParams: string[]): Promise<T> {
        return this.callApi({
            method: 'delete',
            pathParams: [...pathParams, itemId.toString()]
        })
    }

    /**
     * A formalization of "create an entity".
     * @param entity
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    create<T>(entity: Object, ...pathParams: string[]): Promise<T> {
        return this.post(entity, ...pathParams) as Promise<T>
    }

    /**
     * A formalization of "create an entity".
     * @param data
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    post<T>(data?: string | Object, ...pathParams: string[]): Promise<T> {
        return this.callApi({
            method: "post",
            pathParams,
            payload: data
        })
    }

    /**
     * Formalization of an "operation" - it is a post, where the path params state the operation name
     * @param operationName
     * @param data
     * @param pathParams
     */
    operation<T>(operationName: string, data?: string | Object, ...pathParams: string[]): Promise<T> {
        return this.post(data, ...[operationName, ...pathParams])
    }

    /**
     * It is a get with an id - a formalization of a classic "get entity by Id"
     * @param id the id of the entity to be retrieved
     * @param conf the configuration for the fetch call (optional)
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    getEntity<T>(id: string, conf ?: RequestInit, ...pathParams: string[]): Promise<T> {
        return this.get([id, ...pathParams], {})
    }

    /**
     * A formalization of "get an entity" but more free, allowing you to specify the path params and query params.
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @param queryParams the query params
     * @returns {Promise<T>}
     */
    get<T>(pathParams?: string | string[], queryParams ?: { [x: string]: string }): Promise<T> {
        return this.callApi({
            method: "get",
            queryParams,
            pathParams: !pathParams ? [] : Array.isArray(pathParams) ? [...pathParams] : [pathParams]
        })
    }

    /**
     * A formalized update. update is a put, where the path params state the entity type and the id.
     * @param id the id of the entity to be updated
     * @param fields the fields to be updated. It can be a string or an object. When it is a string, it is assumed to be a json string, but it is really up to server implementation.
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    update<T>(id: string, fields: Object | string, ...pathParams: string[]): Promise<T> {
        return this.callApi({
            method: "put",
            pathParams,
            payload: fields
        })
    }
}
