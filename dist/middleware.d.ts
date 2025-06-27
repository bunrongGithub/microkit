import type { Request, Response, NextFunction } from "express";
/**
 * Global error handling middleware
 */
export declare const errorMiddleware: (err: Error, _req: Request, res: Response, _next: NextFunction) => Response;
