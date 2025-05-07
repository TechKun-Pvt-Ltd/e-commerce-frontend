
export type ApiResponse<T> = Promise<[T, number, string]>;

export type ServiceFunction<T, R> = (...apiArgs: T extends any[] ? T : [T]) => ApiResponse<R>;

export enum ContentType {
    TEXT = "text/html",
    JSON = "application/json",
    IMAGE = "image/jpeg"
}

export interface ErrorResponse {
    error: string;
}

export enum SortOrder {
    ASCENDING = 'ASCENDING',
    DESCENDING = 'DESCENDING'
}

export type SortOption = {
    fieldName: string;
    order: SortOrder;
}