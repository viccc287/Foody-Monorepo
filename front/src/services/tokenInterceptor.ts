import tokenService from "@/services/tokenService.ts";

export const setupFetchInterceptor = () => {
    const originalFetch = window.fetch;

    window.fetch = async (url, options = {}) => {
        if (options.headers && options.headers['X-No-Auth']) {
            const { 'X-No-Auth': noAuth, ...restHeaders } = options.headers;
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