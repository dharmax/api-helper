export type URLOptions = {
    hash?: boolean
    queryParams?: { [key: string]: any }
    path?: string[]

}

/**
 * Simply builds a URL.
 * @see URLOptions
 * @param baseUrl
 * @param options
 */
export function buildUrl(baseUrl: string, options: URLOptions) {
    let queryString: string[] = []
    let key
    let builtUrl

    if (baseUrl === null)
        builtUrl = ''
    else if (typeof (baseUrl) === 'object') {
        builtUrl = ''
        options = baseUrl
    } else
        builtUrl = baseUrl


    if (options) {
        if (options.path && options.path.length)
            builtUrl += '/' + options.path.join('/')

        if (options.queryParams) {
            for (key in options.queryParams) {
                if (options.queryParams.hasOwnProperty(key)) {
                    const value = options.queryParams[key]
                    if (value === null || value === undefined)
                        continue
                    queryString.push(key + '=' + value)
                }
            }
            builtUrl += '?' + queryString.join('&')
        }

        if (options.hash)
            builtUrl += '#' + options.hash
    }

    return builtUrl
}
