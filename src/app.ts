import express, { type NextFunction, type Request, type Response } from 'express';
import morgan from 'morgan';
import cors from "cors";
import session from 'express-session';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import passport from './config/passport';
import { globalErrorHandler } from './controllers/errorController';

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

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;