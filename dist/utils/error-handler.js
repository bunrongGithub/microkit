"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
/**
 * Base API error class
 */
class ApiError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        this.timestamp = new Date();
        this.details = details;
        // Ensures proper instanceof checks work for this custom error
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    /**
     * Create a bad request error (400)
     */
    static badRequest(message = "Bad Request", details) {
        console.log("badRequest() Call");
        return new ApiError(message, 400, details);
    }
    /**
     * Create an unauthorized error (401)
     */
    static unauthorized(message = "Unauthorized", details) {
        return new ApiError(message, 401, details);
    }
    /**
     * Create a forbidden error (403)
     */
    static forbidden(message = "Forbidden", details) {
        return new ApiError(message, 403, details);
    }
    /**
     * Create a moongo duplicat value error
     */
    static duplicate(message = "duplicat value", details) {
        return new ApiError(message, 409, details);
    }
    /**
     * Create a not found error (404)
     */
    static notFound(message = "Resource not found", details) {
        return new ApiError(message, 404, details);
    }
    /**
     * Create a conflict error (409)
     */
    static conflict(message = "Conflict", details) {
        return new ApiError(message, 409, details);
    }
    /**
     * Create a validation error (422)
     */
    static validation(message = "Validation Error", details) {
        return new ApiError(message, 422, details);
    }
    /**
     * Create a server error (500)
     */
    static internal(message = "Internal Server Error", details) {
        return new ApiError(message, 500, details);
    }
    static invalidCredentails(message = "User email or password incorrect", details) {
        return new ApiError(message, 400, details);
    }
    /**
     * Convert the error to a plain object
     */
    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
        };
    }
}
exports.ApiError = ApiError;
