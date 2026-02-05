import express, { type NextFunction, type Request, type Response } from 'express';
import morgan from 'morgan';
import cors from "cors";
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import passport from './config/passport.js';
import { globalErrorHandler } from './controllers/errorController.js';
import MongoStore from "connect-mongo";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL!,
        }),
        cookie: {
            maxAge: 24 * 60 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/albums', albumRoutes);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;