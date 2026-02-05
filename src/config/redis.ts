import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL!;

const redisClient = createClient({
    url: redisUrl
});

redisClient.on('error', (err) => {
    console.error('Redis client error: ', err)
});

redisClient.on('connect', () => {
    console.log('Redis connected succesfully!')
});

redisClient.on('ready', () => {
    console.log('Redis is ready to accept commands!')
});

export const connectRedis = async() => {
    try{
        if(!redisClient.isOpen){
            await redisClient.connect();
        }

    }catch(err){
        console.error('Failed to connect to Redis: ', err);
        throw err;
    }
}

export default redisClient;