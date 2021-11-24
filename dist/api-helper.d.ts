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
export declare function post(url: string, data: object | string, conf?: RequestInit): Promise<any>;
export declare function remove(url: string, conf?: RequestInit): Promise<any>;
export declare function put(url: string, data: object | string, conf?: any): Promise<any>;
/**
 * A generic REST call
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 */
export declare function callApi(url: string, method?: 'post' | 'get' | 'delete' | 'put', conf_?: RequestInit, payload?: string | Object): Promise<any>;
interface CallApiParameters {
    method: 'post' | 'get' | 'delete' | 'put';
    pathParams?: string[];
    queryParams?: {
        [x: string]: string;
    } | undefined;
    payload?: string | Object;
    conf?: RequestInit;
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
     *
     * @param resourceNameOrFullUrl
     * @param useDefaultBaseOrServiceRoot
     */
    constructor(resourceNameOrFullUrl: string, useDefaultBaseOrServiceRoot?: boolean | string);
    headerGenerator(): null;
    callApi({ method, pathParams, queryParams, payload }: CallApiParameters): Promise<any>;
    remove(itemId: string | number, ...pathParams: string[]): Promise<any>;
    /**
     * A formalization of "create an entity".
     * @param entity
     * @param pathParams where you can specify an entity type which is not the basic associated resource entity type
     */
    create(entity: Object, ...pathParams: string[]): Promise<any>;
    post(data?: string | Object, ...pathParams: string[]): Promise<any>;
    /**
     * A formalization of an "operation" - it is a post, where the path params state the operation name
     * @param operationName
     * @param data
     * @param pathParams
     */
    operation(operationName: string, data?: string | Object, ...pathParams: string[]): Promise<any>;
    /**
     * It is a get with an id - a formalization of "get entity by Id"
     * @param id
     * @param conf
     * @param pathParams
     */
    getEntity(id: string, conf?: RequestInit, ...pathParams: string[]): Promise<any>;
    get(pathParams: string | string[], queryParams?: {
        [x: string]: string;
    }): Promise<any>;
    /**
     * A formalized update
     * @param id
     * @param fields
     * @param pathParams
     */
    update(id: string, fields: Object | string, ...pathParams: string[]): Promise<any>;
}
export declare function hello(): string;
export {};
