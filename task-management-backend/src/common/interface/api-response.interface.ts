export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ResponseMeta {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
}

export interface ApiResponse<T> {
    data: T;
    status: 'success' | 'error';
    message?: string;
    errorCode?: string;
    errors?: Record<string, string[]>;
    meta: ResponseMeta;
}

/** Shape returned by service methods that support pagination */
export interface PaginatedServiceResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}