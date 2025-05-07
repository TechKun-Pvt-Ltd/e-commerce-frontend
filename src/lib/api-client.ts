import { ContentType } from "@/types/api";

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

    public setHeader(key: string, value: any) {
        this.headers[key] = value;
    }

    public removeHeader(key: string) {
        delete this.headers[key];
    }

    private async request<T>(method: string, endpoint: string, requestOptions: Options, contentType: ContentType): Promise<[T, number, string]> {
        const params: Record<string, string> = {};
        if (requestOptions.params)
            Object.entries(requestOptions.params)
                .forEach(([key, value]) => params[key] = String(value));

        const url = `${this.baseURL}${endpoint}?${new URLSearchParams(params).toString()}`;
        const headers = {...this.headers};
        headers['Content-Type'] = contentType;

        const options: RequestInit = { method, headers };
        if (requestOptions.data)
            options.body = JSON.stringify(requestOptions.data);

        try {
            const response = await fetch(url, options);

            if (contentType === ContentType.JSON) {
                const jsonResponse = await response.json();
                return [jsonResponse, response.status, (jsonResponse?.error || undefined)];
            }

            if (contentType === ContentType.TEXT) {
                const textResponse = await response.text();
                return [textResponse as T, response.status, textResponse];
            }

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
            // console.log("Base 64 acquired");

            return [base64Data as T, response.status, ""];
        } catch (error) {
            throw error;
        }
    }

    public get<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): Promise<[T, number, string]> {
        return this.request<T>('GET', endpoint, options, contentType);
    }

    public post<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): Promise<[T, number, string]> {
        return this.request<T>('POST', endpoint, options, contentType);
    }

    public put<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): Promise<[T, number, string]> {
        return this.request<T>('PUT', endpoint, options, contentType);
    }

    public patch<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): Promise<[T, number, string]> {
        return this.request<T>('PATCH', endpoint, options, contentType);
    }

    public delete<T>(
        endpoint: string, options: Options = {},
        contentType: ContentType = ContentType.JSON
    ): Promise<[T, number, string]> {
        return this.request<T>('DELETE', endpoint, options, contentType);
    }
}

export default ApiClient;