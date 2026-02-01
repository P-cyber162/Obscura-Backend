import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName= process.env.CLOUDINARY_CLOUD_NAME;
const apiKey= process.env.CLOUDINARY_API_KEY;
const apiSecret= process.env.CLOUDINARY_SECRET_KEY;

if(!cloudName || !apiKey || !apiSecret){
    console.error('Cloudinary credentials are missing!');
    throw Error('Cloudinary credentilas are missing in envirinment variables!');
};

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
});

export default cloudinary;