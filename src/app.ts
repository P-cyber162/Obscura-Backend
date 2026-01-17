import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { createApiLimitter } from './middleware/rateLimmtter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimitter = createApiLimitter();

app.use('/api', apiLimitter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

export default app;