import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
dotenv.config();

const app = express();

const startServer = async () => {
    try {
        // DATABASE CONNECTION
        await connectDB();
        
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