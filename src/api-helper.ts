import {buildUrl} from './build-url'
import {fetch} from 'native-fetch'
import {Spinner} from './spinner'
import {browser} from './browser'

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
 * A generic REST call
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 */
export async function callApi(url: string, method: 'post' | 'get' | 'delete' | 'put' = 'get', conf_: RequestInit = {}, payload?: string | Object) {
    if (!conf_.headers)
        delete conf_.headers
    const conf: RequestInit = {
        method,
        mode: 'cors',
        ...conf_
    }
    if (payload)
        setPayload(payload, conf)

    try {
        Spinner && Spinner.show()
        //@ts-ignore
        const response = await fetch(url, conf).then(r => r.json())
        if (response.error) {
            // noinspection ExceptionCaughtLocallyJS
            throw `${response.error}: ${response.message} (${response.statusCode})`
        }
        return response
        // @ts-ignore
    } catch (e: any) {
        const message = e.message || (typeof e == 'string' ? e : JSON.stringify(e))
        errorReporter(message)
        throw e
    } finally {
        Spinner && Spinner.hide()
    }
}

interface CallApiParameters {
    method: 'post' | 'get' | 'delete' | 'put'
    pathParams?: string[]
    queryParams?: { [x: string]: string } | undefined
    payload?: string | Object
    conf?: RequestInit
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
     *
     * @param resourceNameOrFullUrl
     * @param useDefaultBaseOrServiceRoot
     */
    constructor(protected resourceNameOrFullUrl: string, useDefaultBaseOrServiceRoot: boolean | string = true) {
        if (typeof useDefaultBaseOrServiceRoot === 'string')
            this.resourceUrl = useDefaultBaseOrServiceRoot + '/' + resourceNameOrFullUrl
        else
            this.resourceUrl = useDefaultBaseOrServiceRoot ? defaultBaseUrl + '/' + this.resourceNameOrFullUrl : resourceNameOrFullUrl

    }

    headerGenerator() {
        return null
    }

    callApi({method = 'get', pathParams, queryParams, payload}: CallApiParameters) {
        const headers = this.headerGenerator()
        const conf: RequestInit = headers ? {headers} : {}
        const url = buildUrl(this.resourceUrl, {path: pathParams, queryParams: queryParams})
        return callApi(url, method, conf, payload)
    }

    remove(itemId: string | number, ...pathParams: string[]) {
        return this.callApi({
            method: 'delete',
            pathParams: [...pathParams, itemId.toString()]
        })
    }

    /**
     * A formalization of "create an entity".
     * @param entity
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    create(entity: Object, ...pathParams: string[]) {
        return this.post(entity, ...pathParams)

    }

    post(data?: string | Object, ...pathParams: string[]) {
        return this.callApi({
            method: "post",
            pathParams,
            payload: data
        })
    }

    /**
     * A formalization of an "operation" - it is a post, where the path params state the operation name
     * @param operationName
     * @param data
     * @param pathParams
     */
    operation(operationName: string, data?: string | Object, ...pathParams: string[]) {
        return this.post(data, ...[operationName, ...pathParams])
    }

    /**
     * It is a get with an id - a formalization of "get entity by Id"
     * @param id
     * @param conf
     * @param pathParams
     */
    getEntity(id: string, conf ?: RequestInit, ...pathParams: string[]) {
        return this.get([id, ...pathParams], {})
    }

    get(pathParams: string | string[], queryParams ?: { [x: string]: string }) {
        return this.callApi({
            method: "get",
            queryParams,
            pathParams: [...pathParams]
        })
    }

    /**
     * A formalized update
     * @param id
     * @param fields
     * @param pathParams
     */
    update(id: string, fields: Object | string, ...pathParams: string[]) {
        return this.callApi({
            method: "put",
            pathParams,
            payload: fields
        })
    }
}
