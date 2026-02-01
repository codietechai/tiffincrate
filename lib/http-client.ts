// HTTP Client utility for API calls
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface ApiError extends Error {
    status?: number;
    response?: Response;
}

class HttpClient {
    private baseURL: string;

    constructor(baseURL: string = '') {
        this.baseURL = baseURL;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        let data: any;
        try {
            data = isJson ? await response.json() : await response.text();
        } catch (error) {
            throw new Error('Failed to parse response');
        }

        if (!response.ok) {
            const error = new Error(data?.error || data?.message || `HTTP ${response.status}`) as ApiError;
            error.status = response.status;
            error.response = response;
            throw error;
        }

        return data;
    }

    private getHeaders(customHeaders?: HeadersInit): HeadersInit {
        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
        };

        return {
            ...defaultHeaders,
            ...customHeaders,
        };
    }

    async get<T = any>(
        url: string,
        options?: {
            headers?: HeadersInit;
            signal?: AbortSignal;
        }
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'GET',
            headers: this.getHeaders(options?.headers),
            signal: options?.signal,
        });

        return this.handleResponse<T>(response);
    }

    async post<T = any>(
        url: string,
        data?: any,
        options?: {
            headers?: HeadersInit;
            signal?: AbortSignal;
        }
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'POST',
            headers: this.getHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
            signal: options?.signal,
        });

        return this.handleResponse<T>(response);
    }

    async put<T = any>(
        url: string,
        data?: any,
        options?: {
            headers?: HeadersInit;
            signal?: AbortSignal;
        }
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'PUT',
            headers: this.getHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
            signal: options?.signal,
        });

        return this.handleResponse<T>(response);
    }

    async patch<T = any>(
        url: string,
        data?: any,
        options?: {
            headers?: HeadersInit;
            signal?: AbortSignal;
        }
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'PATCH',
            headers: this.getHeaders(options?.headers),
            body: data ? JSON.stringify(data) : undefined,
            signal: options?.signal,
        });

        return this.handleResponse<T>(response);
    }

    async delete<T = any>(
        url: string,
        options?: {
            headers?: HeadersInit;
            signal?: AbortSignal;
        }
    ): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'DELETE',
            headers: this.getHeaders(options?.headers),
            signal: options?.signal,
        });

        return this.handleResponse<T>(response);
    }
}

// Create and export the default HTTP client instance
export const httpClient = new HttpClient();

// Export the class for custom instances if needed
export { HttpClient };