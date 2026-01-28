import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { connectRedis } from './config/redis';
import { createApiLimitter, createAuthLimitter, createPasswordResetLimitter } from './middleware/rateLimmtter';
import type { Request, Response, NextFunction } from 'express';
import ApiError from './utils/ApiError';


dotenv.config();

const startServer = async () => {
    try {
        // DATABASE CONNECTION
        await connectDB();

        // CONNECT REDIS
        await connectRedis();

        const apiLimitter = createApiLimitter();
        const authLimitter = createAuthLimitter();
        const passwordLimitter = createPasswordResetLimitter();

        app.use('/api', apiLimitter);
        app.use('/api/v1/auth/register', authLimitter);
        app.use('/api/v1/auth/login', authLimitter);
        app.use('/api/v1/auth/forgot-password', passwordLimitter);
        app.use('api/v1/auth/reset-password', passwordLimitter);

        app.all('*', (req: Request, res: Response, next: NextFunction) => {
            /*res.status(400).json({
                status: 'fail',
                message: `Can't access ${req.originalUrl} on this server!`
            });*/
            const err = new ApiError(`Can't access ${req.originalUrl} on this server!`, 404);
            next(err);
        });
        
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (err) {
        console.log('Error:💥 DB connection failed!');
    };
};

startServer();