import mongoose from 'mongoose'; 
import dotenv from 'dotenv';
dotenv.config();

const db = process.env.DATABASE_URL?.replace(
    '<PASSWORD>', process.env.DATABASE_PASSWORD || ''
) || '';

const connectDB = async() => {
    try{
        await mongoose.connect(db, {
            // Critical fix: Use tlsAllowInvalidCertificates for Docker/container environments
            // This bypasses certificate validation issues in containerized environments
            tlsAllowInvalidCertificates: true,
            tlsInsecure: true, // For Node.js v20+
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            waitQueueTimeoutMS: 30000,
        });
        console.log("DB connection successful 🔥");

    }catch(err){
        console.log('Error: ', err);  
        process.exit(1);
    }

}
export default connectDB;