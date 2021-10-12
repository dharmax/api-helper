export declare type URLOptions = {
    hash?: boolean;
    queryParams?: {
        [key: string]: any;
    };
    path?: string[];
};
/**
 * Simply builds a URL.
 * @see URLOptions
 * @param baseUrl
 * @param options
 */
export declare function buildUrl(baseUrl: string, options: URLOptions): string;
