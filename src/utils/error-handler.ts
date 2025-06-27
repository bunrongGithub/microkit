/**
 * Base API error class
 */
export class ApiError extends Error {
    public readonly statusCode: number
    public readonly success: boolean = false
    public readonly timestamp: Date
    public readonly details?: Record<string, any>

    constructor(message: string, statusCode = 500, details?: Record<string, any>) {
        super(message)
        this.statusCode = statusCode
        this.timestamp = new Date()
        this.details = details

        // Ensures proper instanceof checks work for this custom error
        Object.setPrototypeOf(this, ApiError.prototype)
    }

    /**
     * Create a bad request error (400)
     */
    public static badRequest(message = "Bad Request", details?: Record<string, any>): ApiError {
        console.log("badRequest() Call")
        return new ApiError(message, 400, details)
    }

    /**
     * Create an unauthorized error (401)
     */
    public static unauthorized(message = "Unauthorized", details?: Record<string, any>): ApiError {
        return new ApiError(message, 401, details)
    }

    /**
     * Create a forbidden error (403)
     */
    public static forbidden(message = "Forbidden", details?: Record<string, any>): ApiError {
        return new ApiError(message, 403, details)
    }
    /**
     * Create a moongo duplicat value error
     */
    public static duplicate(message = "duplicat value", details?: Record<string, any>): ApiError {
        return new ApiError(message, 409, details)
    }
    /**
     * Create a not found error (404)
     */
    public static notFound(message = "Resource not found", details?: Record<string, any>): ApiError {
        return new ApiError(message, 404, details)
    }

    /**
     * Create a conflict error (409)
     */
    public static conflict(message = "Conflict", details?: Record<string, any>): ApiError {
        return new ApiError(message, 409, details)
    }

    /**
     * Create a validation error (422)
     */
    public static validation(message = "Validation Error", details?: Record<string, any>): ApiError {
        return new ApiError(message, 422, details)
    }

    /**
     * Create a server error (500)
     */
    public static internal(message = "Internal Server Error", details?: Record<string, any>): ApiError {
        return new ApiError(message, 500, details)
    }
    public static invalidCredentails(message = "User email or password incorrect", details?: Record<string, any>): ApiError {
        return new ApiError(message, 400, details)
    }
    /**
     * Convert the error to a plain object
     */
    public toJSON(): Record<string, any> {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
        }
    }
}