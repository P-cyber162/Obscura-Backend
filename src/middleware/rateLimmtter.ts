import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis";

export const createApiLimitter = () => rateLimit({
    store: new RedisStore ({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: 'rl:api:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        status: 'error',
        message: 'Too many request on this IP. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false, 
});

export const createAuthLimitter = () => rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: 'rl:auth:'
    }),
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        status: 'error',
        message: 'Too many authntication attempts. Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

export const createPasswordResetLimitter = () => rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: 'rl:password:'
    }),
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        status: 'error',
        message: 'Too many password reset attempts . Please try again after 1 hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});