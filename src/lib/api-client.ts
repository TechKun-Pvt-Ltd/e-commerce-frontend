import { ApiResponse, ContentType } from "@/types/api";

interface Options {
    params?: Record<string, any>;
    data?: any;
};

class ApiClient {
    private baseURL: string;
    private headers: Record<string, string>;

    constructor(baseURL: string = '') {
        this.baseURL = baseURL;
        this.headers = {};
    }

    public setHeader(key: string, value: string) {
        this.headers[key] = value;
    }
    public appendHeader(key: string, value: string) {
        this.headers[key] = value;
        return this;
    }
    public removeHeader(key: string) {
        delete this.headers[key];
    }

    private async request<T>(method: string, endpoint: string, requestOptions: Options, contentType: ContentType): ApiResponse<T> {
        const params: Record<string, string> = {};
        if (requestOptions.params)
            Object.entries(requestOptions.params)
                .forEach(([key, value]) => params[key] = String(value));

        const url = `${this.baseURL}${endpoint}?${new URLSearchParams(params).toString()}`;
        const headers = {...this.headers};
        headers['Content-Type'] = contentType;

        const options: {
            method: string;
            path: string;
            headers?: HeadersInit;
            body?: BodyInit;
        } = {
            method,
            path: url,
            headers
        };
        if (requestOptions.data)
            options.body = requestOptions.data;

        try {
            const response = await fetch('/api/forward', {
                method: 'POST',
                body: JSON.stringify(options)
            });
            if (!response.ok)
                return response.json()
                    .then(data => ({
                        success: false,
                        error: data.message
                    }));

            if (contentType === ContentType.JSON)
                return response.json()
                    .then(data => ({
                        data,
                        success: true
                    }));

            if (contentType === ContentType.TEXT)
                return response.text()
                    .then(text => ({
                        data: text as T,
                        success: true
                    }));

            const blob = await response.blob();
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    resolve(base64String);
                }
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            return {
                data: base64Data as T,
                success: true
            };
        } catch (error) {
            throw error;
        }
    }

    public get<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('GET', endpoint, options, contentType);
    }

    public post<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('POST', endpoint, options, contentType);
    }

    public put<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('PUT', endpoint, options, contentType);
    }

    public patch<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('PATCH', endpoint, options, contentType);
    }

    public delete<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): ApiResponse<T> {
        return this.request<T>('DELETE', endpoint, options, contentType);
    }
}

export default ApiClient;