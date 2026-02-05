import mongoose from 'mongoose'; 
import dotenv from 'dotenv';
dotenv.config();

const db = process.env.DATABASE_URL?.replace(
    '<PASSWORD>', process.env.DATABASE_PASSWORD || ''
) || '';

const connectDB = async() => {
    try{
        await mongoose.connect(db, {
            tlsAllowInvalidCertificates: true,
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