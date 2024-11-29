import tokenService from "@/services/tokenService.ts";

export const setupFetchInterceptor = () => {
    const originalFetch = window.fetch;

    window.fetch = async (url, options: RequestInit & { headers?: HeadersInit & { 'X-No-Auth'?: string } } = {}) => {
        if (options.headers && options.headers['X-No-Auth']) {
            const {  ...restHeaders } = options.headers;
            return originalFetch(url, {
                ...options,
                headers: restHeaders,
            });
        }

        const token = tokenService.getToken()

        const headers = {
            ...options.headers,
            Authorization: token ? `Bearer ${token}` : '',
        };

        return originalFetch(url, {
            ...options,
            headers,
        });
    };
};