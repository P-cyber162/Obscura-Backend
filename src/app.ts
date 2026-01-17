import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

export default app;