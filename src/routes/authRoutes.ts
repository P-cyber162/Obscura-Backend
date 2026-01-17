import express from 'express';
import { signUp, login, forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router
    .route('/register')
    .post(signUp);

router  
    .route('/login')
    .post(login);

router
    .route('/forgotPassword')
    .post(forgotPassword);

router
    .route('/resetPassword')
    .post(resetPassword);

export default router;