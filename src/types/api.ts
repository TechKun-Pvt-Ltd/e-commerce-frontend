
export type ApiResponse<T> = Promise<{
    data: T;
    success: true;
    error?: undefined;
} | {
    data?: undefined;
    success: false;
    error: string;
}>;

export type ServiceFunction<T, R> = (...apiArgs: T extends any[] ? T : [T]) => ApiResponse<R>;

export type ServiceResponse<S extends ServiceFunction<any, any>> = S extends ServiceFunction<any, infer R> ? R : never;

export enum ContentType {
    TEXT = "text/html",
    JSON = "application/json",
    IMAGE = "image/jpeg"
}

export enum SortOrder {
    ASCENDING = 'ASCENDING',
    DESCENDING = 'DESCENDING'

}

export type SortOption = {
    fieldName: string;
    order: SortOrder;
}

export interface Pageable {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    unpaged: boolean;
}

export interface PageResponse<T> {
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: Pageable;
    size: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    totalElements: number;
    totalPages: number;
}