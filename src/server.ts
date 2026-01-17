import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { connectRedis } from './config/redis';

dotenv.config();

const startServer = async () => {
    try {
        // DATABASE CONNECTION
        await connectDB();

        // CONNECT REDIS
        await connectRedis();
        
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (err) {
        console.log('Error:💥 DB connection failed!');
    }
};

startServer();