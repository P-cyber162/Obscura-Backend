import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { connectRedis } from './config/redis';
import { createApiLimitter, createAuthLimitter, createPasswordResetLimitter } from './middleware/rateLimmtter';


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