import express, { type NextFunction, type Request, type Response } from 'express';
import morgan from 'morgan';
import session from 'express-session';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import passport from './config/passport';

const app = express();

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

// GLOBAL ERROR HANDLER
app.use((err: Error, req: Request, res:Response, next: NextFunction) => {
    console.error('Global error: ', err);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong!'
    });
});

export default app;