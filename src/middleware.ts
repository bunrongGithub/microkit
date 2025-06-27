import type { Request, Response, NextFunction } from "express"

import { ValidateError } from "tsoa"
import mongoose from "mongoose"
import { ApiError } from "./utils/error-handler"


/**
 * Global error handling middleware
 */
export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction): Response => {

    if (err instanceof ValidateError || err instanceof mongoose.Error.ValidationError) {
        let formatedDetails: Record<string, any> = {}
        if (err instanceof mongoose.Error.ValidationError) {
            formatedDetails = Object.entries(err.errors).reduce((acc, [key, value]) => {
                acc[key] = value.message
                return acc
            }, {} as Record<string, any>)
        }
        return res.status(422).json({
            success: false,
            statusCode: 422,
            message: "Validation Failed",
            details: err instanceof ValidateError ? err.fields : formatedDetails,
            timestamp: new Date().toISOString(),
        })
    }
    if ('code' in err && err.code == 11000) {
        const duplicateDetails = (err as any).keyValue || {}
        const fields = Object.keys(duplicateDetails).join(", ")
        const message = `Duplicate value for field(s): ${fields}`
        const apiErr = ApiError.duplicate(message, duplicateDetails)
        return res.status(apiErr.statusCode).json(apiErr.toJSON())
    }
    // Handle our custom API errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(err.toJSON())
    }

    console.error(`Unhandled error: ${err.message}`, err)

    const serverError = ApiError.internal()
    return res.status(serverError.statusCode).json(serverError.toJSON())
}