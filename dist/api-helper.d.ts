export declare let defaultBaseUrl: string;
export declare function setDefaultBaseUrl(url: string): void;
export interface IReadOptionsFront {
    from: number;
    count: number;
    entityOnly?: boolean;
    queryName?: string;
    queryParams?: Object;
    sort?: string;
    projection?: string[];
    [x: string]: any;
}
export interface IReadResult {
    error?: string;
    items: any[];
    total?: number;
    totalFiltered: number;
    opts?: any;
}
export declare let errorReporter: (message: string) => void;
export declare function setErrorReporter(reporter: (s: string) => any): void;
export declare function post(url: string, data: object | string, conf?: RequestInit): Promise<unknown>;
export declare function remove(url: string, conf?: RequestInit): Promise<unknown>;
export declare function put(url: string, data: object | string, conf?: any): Promise<unknown>;
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
export declare function callApi<T>(url: string, method?: 'post' | 'get' | 'delete' | 'put', conf_?: RequestInit, payload?: string | Object, retryConfig?: RetryConfig): Promise<T>;
interface CallApiParameters {
    method: 'post' | 'get' | 'delete' | 'put';
    pathParams?: string[];
    queryParams?: {
        [x: string]: string;
    } | undefined;
    payload?: string | Object;
    conf?: RequestInit;
    retryConfig?: RetryConfig;
}
/**
 * The generic Store abstraction. Derive your own store singleton per your REST resources from here.
 * It is meant to provide a clear, verb-based representation of resource. As it is, it provides the standard REST verbs,
 * out of the box, including the option to set different that the default base url, and custom headers, event without
 * overriding and method, but you should add your own methods that represents your specific semantics and data modeling
 * (in case it is different that the server's modeling) as well as caching and event broadcasting when relevant to you.
 */
export declare class StoreApi {
    protected resourceNameOrFullUrl: string;
    protected readonly resourceUrl: string;
    /**
     * Creates a new StoreApi instance. The resource name is used to build the full url to the resource.
     * @param resourceNameOrFullUrl the name of the resource or the full url to the resource
     * @param useDefaultBaseOrServiceRoot if true, the default base url will be used, otherwise the full url will be used
     * @see setDefaultBaseUrl
     */
    constructor(resourceNameOrFullUrl: string, useDefaultBaseOrServiceRoot?: boolean | string);
    /**
     * Override this method to provide custom headers.
     */
    headerGenerator(): Object | null;
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
    callApi<T>({ method, pathParams, queryParams, payload, conf, retryConfig }: CallApiParameters): Promise<T>;
    /**
     * A formalization of "delete an entity".
     * @param itemId the id of the entity to be deleted
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    remove<T>(itemId: string | number, ...pathParams: string[]): Promise<T>;
    /**
     * A formalization of "create an entity".
     * @param entity
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    create<T>(entity: Object, ...pathParams: string[]): Promise<T>;
    /**
     * A formalization of "create an entity".
     * @param data
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    post<T>(data?: string | Object, ...pathParams: string[]): Promise<T>;
    /**
     * Formalization of an "operation" - it is a post, where the path params state the operation name
     * @param operationName
     * @param data
     * @param pathParams
     */
    operation<T>(operationName: string, data?: string | Object, ...pathParams: string[]): Promise<T>;
    /**
     * It is a get with an id - a formalization of a classic "get entity by Id"
     * @param id the id of the entity to be retrieved
     * @param conf the configuration for the fetch call (optional)
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    getEntity<T>(id: string, conf?: RequestInit, ...pathParams: string[]): Promise<T>;
    /**
     * A formalization of "get an entity" but more free, allowing you to specify the path params and query params.
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @param queryParams the query params
     * @returns {Promise<T>}
     */
    get<T>(pathParams?: string | string[], queryParams?: {
        [x: string]: string;
    }): Promise<T>;
    /**
     * A formalized update. update is a put, where the path params state the entity type and the id.
     * @param id the id of the entity to be updated
     * @param fields the fields to be updated. It can be a string or an object. When it is a string, it is assumed to be a json string, but it is really up to server implementation.
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     * @returns {Promise<T>}
     */
    update<T>(id: string, fields: Object | string, ...pathParams: string[]): Promise<T>;
}
export {};
