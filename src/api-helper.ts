import {buildUrl} from './build-url'

export let defaultBaseUrl = window.location.origin

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
    requestNumber?: number // created automatically
}

export interface IReadResult {
    error?: string
    items: any[]
    total?: number
    totalFiltered: number
    opts?: IReadOptionsFront
}

export let errorReporter = (message: string) => {
    console.error(message)
}

export function setErrorReporter(reporter: (s: string) => any) {
    errorReporter = reporter
}

export async function post(url: string, data: object, conf_: any = {}) {
    return callApi(url, 'post', Object.assign(conf_, {
        body: JSON.stringify(data)
    }))
}

export async function remove(url: string, conf_: any = {}) {
    return callApi(url, 'delete')
}


export async function put(url: string, data: object, conf_: any = {}) {
    return callApi(url, 'put', Object.assign(conf_, {
        body: JSON.stringify(data)
    }))
}

const Spinner = new class {
    private counter = 0

    constructor(private readonly spinnerElement: HTMLElement | undefined = undefined) {
        if (this.spinnerElement)
            return
        this.spinnerElement = document.body.getElementsByClassName('spinner')[0] as HTMLElement
        if (!this.spinnerElement) {
            this.spinnerElement = document.createElement('div')
            document.body.appendChild(this.spinnerElement)
        }
    }

    get spinner() {
        return this.spinnerElement
    }

    show() {
        this.counter++
        const s = this.spinner
        if (s)
            s.style.visibility = 'visible'
    }

    hide() {
        if (--this.counter > 0)
            return
        const s = this.spinner
        if (s)
            s.style.visibility = 'hidden'
    }
}

/**
 * A generic REST call
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 */
export async function callApi(url: string, method: 'post' | 'get' | 'delete' | 'put' = 'get', conf_: any = {}) {
    const conf: RequestInit = {
        ...conf_,
        method,
        mode: 'cors',
        headers: new Headers({
            'session-token': localStorage.sessionToken,
            'Content-Type': 'application/json'
        })
    }
    try {
        Spinner.show()
        const response = await fetch(url, conf).then(r => r.json())
        if (response.error) {
            // noinspection ExceptionCaughtLocallyJS
            throw `${response.error}: ${response.message} (${response.statusCode})`
        }
        return response
    } catch (e: any) {
        const message = e.message || (typeof e == 'string' ? e : JSON.stringify(e))
        errorReporter(message)
        throw e
    } finally {
        Spinner.hide()
    }
}

/**
 * The generic Store abstraction. Derive your own store singleton per your REST resources from here.
 */
export class StoreApi {
    protected readonly resourceUrl: string;

    constructor(protected resourceNameOrFullUrl: string, useDefaultBase = true) {
        this.resourceUrl = useDefaultBase ? defaultBaseUrl + '/' + this.resourceNameOrFullUrl : resourceNameOrFullUrl
    }


    load(opt_: IReadOptionsFront, ...pathParams: string[]): Promise<IReadResult> {
        const opt = {...opt_}
        opt.queryParams && (opt.queryParams = JSON.stringify(opt.queryParams))
        return callApi(buildUrl(this.resourceUrl, {
            queryParams: opt,
            path: pathParams
        }))
    }

    remove(itemId: string | number, ...pathParams: string[]) {
        pathParams = pathParams || []
        return remove([this.resourceUrl, ...pathParams, itemId].join('/'))
    }

    create(entity: Object, ...pathParams: string[]) {
        return post(this.resourceUrl + ['', ...pathParams].join('/'), entity)
    }

    operation(operationName: string, data?: any, ...pathParams: string[]) {
        return post(this.resourceUrl + ['', operationName, ...pathParams].join('/'), data)
    }

    getEntity(id: string, opts?: Object, ...pathParams: string[]) {
        return callApi(buildUrl(`${this.resourceUrl}${id ? '/' + id : ''}`, {
            path: pathParams,
            queryParams: opts
        }))
    }

    get(pathParams: string | string[], queryParams?: Object) {
        return callApi(buildUrl(this.resourceUrl, {
            path: Array.isArray(pathParams) ? pathParams : [pathParams],
            queryParams: queryParams
        }))
    }

    update(id: string, fields: Object, ...pathParams: string[]) {
        return put(buildUrl(`${this.resourceUrl}${id ? '/' + id : ''}`, {
            path: pathParams
        }), fields)
    }
}
