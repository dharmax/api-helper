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
    requestNumber?: number;
}
export interface IReadResult {
    error?: string;
    items: any[];
    total?: number;
    totalFiltered: number;
    opts?: IReadOptionsFront;
}
export declare let errorReporter: (message: string) => void;
export declare function setErrorReporter(reporter: (s: string) => any): void;

export declare function post(url: string, data: object | string, conf_?: any): Promise<any>;

export declare function remove(url: string, conf_?: any): Promise<any>;

export declare function put(url: string, data: object | string, conf_?: any): Promise<any>;

/**
 * A generic REST call
 * @param url target
 * @param method method
 * @param conf_ extra configuration for the fetch call
 */
export declare function callApi(url: string, method?: 'post' | 'get' | 'delete' | 'put', conf_?: any): Promise<any>;

/**
 * The generic Store abstraction. Derive your own store singleton per your REST resources from here.
 */
export declare class StoreApi {
    protected resourceNameOrFullUrl: string;
    protected readonly resourceUrl: string;
    /**
     * Can be overridden to create JWT or whatever
     */
    headerGenerator: () => null;

    constructor(resourceNameOrFullUrl: string, useDefaultBase?: boolean);

    callApi(url: string, method?: 'post' | 'get' | 'delete' | 'put', conf_?: any): Promise<any>;

    load(opt_: IReadOptionsFront, ...pathParams: string[]): Promise<IReadResult>;

    remove(itemId: string | number, ...pathParams: string[]): Promise<any>;

    create(entity: Object, ...pathParams: string[]): Promise<any>;

    operation(operationName: string, data?: any, ...pathParams: string[]): Promise<any>;

    getEntity(id: string, opts?: Object, ...pathParams: string[]): Promise<any>;

    get(pathParams: string | string[], queryParams?: Object): Promise<any>;

    update(id: string, fields: Object | string, ...pathParams: string[]): Promise<any>;
}
