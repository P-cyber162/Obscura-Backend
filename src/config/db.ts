import mongoose from 'mongoose'; 
import dotenv from 'dotenv';
dotenv.config();

const db = process.env.DATABASE_URL?.replace(
    '<PASSWORD>', process.env.DATABASE_PASSWORD || ''
) || '';

const connectDB = async() => {
    try{
        await mongoose.connect(db);
        console.log("DB connection successful 🔥");

    }catch(err){
        console.log('Error: ', err);  
        process.exit(1);
    }

}
export default connectDB;