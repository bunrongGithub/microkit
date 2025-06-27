/**
 * Base API error class
 */
export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly success: boolean;
    readonly timestamp: Date;
    readonly details?: Record<string, any>;
    constructor(message: string, statusCode?: number, details?: Record<string, any>);
    /**
     * Create a bad request error (400)
     */
    static badRequest(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Create an unauthorized error (401)
     */
    static unauthorized(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Create a forbidden error (403)
     */
    static forbidden(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Create a moongo duplicat value error
     */
    static duplicate(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Create a not found error (404)
     */
    static notFound(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Create a conflict error (409)
     */
    static conflict(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Create a validation error (422)
     */
    static validation(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Create a server error (500)
     */
    static internal(message?: string, details?: Record<string, any>): ApiError;
    static invalidCredentails(message?: string, details?: Record<string, any>): ApiError;
    /**
     * Convert the error to a plain object
     */
    toJSON(): Record<string, any>;
}
