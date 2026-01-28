import type { Request, Response, NextFunction } from 'express';

export const CatchAsync = (func: (req: Request, res: Request, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Request, next: NextFunction) => {
        func(req, res, next).catch((err) => next(err));
    }
};