import type { Request, Response, NextFunction } from 'express';
import ApiError from './../utils/ApiError.js';

export const globalErrorHandler = (err: Error, req: Request, res:Response, next: NextFunction) => {
    const apiError = err as ApiError;

    const statusCode = apiError.statusCode || 500;
    const status = apiError.status || 'error';
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error!'
    });
}