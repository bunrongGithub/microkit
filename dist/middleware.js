"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const tsoa_1 = require("tsoa");
const mongoose_1 = __importDefault(require("mongoose"));
const error_handler_1 = require("./utils/error-handler");
/**
 * Global error handling middleware
 */
const errorMiddleware = (err, _req, res, _next) => {
    if (err instanceof tsoa_1.ValidateError || err instanceof mongoose_1.default.Error.ValidationError) {
        let formatedDetails = {};
        if (err instanceof mongoose_1.default.Error.ValidationError) {
            formatedDetails = Object.entries(err.errors).reduce((acc, [key, value]) => {
                acc[key] = value.message;
                return acc;
            }, {});
        }
        return res.status(422).json({
            success: false,
            statusCode: 422,
            message: "Validation Failed",
            details: err instanceof tsoa_1.ValidateError ? err.fields : formatedDetails,
            timestamp: new Date().toISOString(),
        });
    }
    if ('code' in err && err.code == 11000) {
        const duplicateDetails = err.keyValue || {};
        const fields = Object.keys(duplicateDetails).join(", ");
        const message = `Duplicate value for field(s): ${fields}`;
        const apiErr = error_handler_1.ApiError.duplicate(message, duplicateDetails);
        return res.status(apiErr.statusCode).json(apiErr.toJSON());
    }
    // Handle our custom API errors
    if (err instanceof error_handler_1.ApiError) {
        return res.status(err.statusCode).json(err.toJSON());
    }
    console.error(`Unhandled error: ${err.message}`, err);
    const serverError = error_handler_1.ApiError.internal();
    return res.status(serverError.statusCode).json(serverError.toJSON());
};
exports.errorMiddleware = errorMiddleware;
